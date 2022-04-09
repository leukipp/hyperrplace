class Stage {
    constructor(view) {
        this.root = view.root;
        this.config = view.config;
        this.view = view;

        this.name = document.title;
        this.layer = {
            canvas: 1,
            voxels: 2,
            boomOn: 3,
            boomOff: 4
        };
        this.scene = new THREE.Scene();

        this.fps = [Math.max(30, this.config.fps)];

        this.clock = new THREE.Clock();
        this.delta = 0;

        this.init = new Promise(async function (resolve) {

            // stage ambient light
            this.ambientLight = new THREE.AmbientLight(0xffffff, 1.0);

            // stage camera
            this.camera = new THREE.PerspectiveCamera(60, this.root.clientWidth / this.root.clientHeight, 0.1, 10000);
            this.camera.add(this.ambientLight);
            this.scene.add(this.camera);

            // stage camera layers
            Object.values(this.layer).forEach((layer) => {
                this.camera.layers.enable(layer);
            });

            // renderer
            this.renderer = new THREE.WebGLRenderer({ logarithmicDepthBuffer: true, preserveDrawingBuffer: true, antialias: true });
            this.renderer.setPixelRatio(window.devicePixelRatio);

            // orbiter controls
            this.controls = new THREE.MapControls(this.camera, this.renderer.domElement);
            this.controls.autoRotateSpeed = -this.config.rotation;
            this.controls.autoRotate = !!this.config.rotation;
            this.controls.minDistance = 0.1;
            this.controls.maxDistance = this.config._canvas.size.height * 2;
            this.controls.screenSpacePanning = true;
            this.controls.enablePan = true;

            // user interface
            this.stats = new Stats();
            this.root.querySelector('#info').append(this.stats.dom);
            this.root.querySelector('#stage').append(this.renderer.domElement);
            this.renderer.setClearColor(this.config.color.background);
            document.body.style.backgroundColor = hexColor(this.config.color.background);

            // reset stage
            this.reset();

            // animations
            this.animate = this.animate.bind(this);
            requestAnimationFrame(this.animate);

            // events
            this.update = this.update.bind(this);
            window.addEventListener('resize', this.update);

            resolve(this);
        }.bind(this));
    }

    status(message, percent) {
        const numeric = getType(percent) === 'number';

        // set status
        let status = this.name;
        if (message) {
            status = numeric ? `${message} (${parseInt(percent, 10)}%)` : message;
        }
        document.title = status;

        // reset status
        if (numeric && percent >= 100) {
            sleep(100).then(() => { this.status() });
        }
    }

    async animate() {
        requestAnimationFrame(this.animate);

        // update clock delta
        this.delta += this.clock.getDelta();

        // desired fps and delta
        const fps = Math.max(30, this.config.fps);
        const delta = 1 / fps;

        // check clock delta
        if (this.delta >= delta) {
            await this.render();

            // append current fps
            this.fps.push(1 / this.delta);
            this.fps = this.fps.slice(-30);

            // update clock delta
            this.delta = this.delta % delta;

            // adjust rotation speed
            this.controls.autoRotate = !!this.config.rotation;
            this.controls.autoRotateSpeed = -this.config.rotation * (30 / truncatedMean(this.fps, 0.0));
        }
    }

    async render() {

        // start stats
        this.stats.begin();

        // update controls
        this.controls.update();

        // render scene
        this.renderer.render(this.scene, this.camera);

        // end stats
        this.stats.end();
    }

    async update() {

        // update renderer size
        this.renderer.setSize(this.root.clientWidth, this.root.clientHeight);

        // update camera projection
        this.camera.aspect = this.root.clientWidth / this.root.clientHeight;
        this.camera.updateProjectionMatrix();
    }

    async export(zip) {
        const stage = zip.folder('stage');

        // navigator
        const navigator = {};
        for (let key in window.navigator) {
            if (['string', 'array', 'number'].includes(getType(window.navigator[key]))) {
                navigator[key] = window.navigator[key];
            }
        }

        // client
        const client = {
            stage: {
                clientWidth: this.root.clientWidth,
                clientHeight: this.root.clientHeight
            },
            screen: {
                width: window.screen.width,
                height: window.screen.height,
                availWidth: window.screen.availWidth,
                availHeight: window.screen.availHeight,
                devicePixelRatio: window.devicePixelRatio
            },
            intl: {
                dateTimeFormat: Intl.DateTimeFormat().resolvedOptions(),
                numberFormat: Intl.NumberFormat().resolvedOptions()
            },
            location: window.location,
            navigator: navigator
        };

        // export config
        stage.file('client.json', JSON.stringify(client, null, 4));

        // export image
        const image = canvasImage(this.renderer.domElement);
        stage.file('image.png', image, { base64: true });
    }

    async reset() {

        // reset camera position
        this.camera.setRotationFromEuler(new THREE.Euler(0, 0, 0));
        this.camera.position.set(0, 0, this.config._canvas.size.width);
        this.controls.target.set(0, 0, 0);

        // update camera
        await this.update();
        await this.render();
        await sleep(100);
    }
}