class Place {
    constructor(stage) {
        this.root = stage.root;
        this.config = stage.config;
        this.view = stage.view;
        this.scene = stage.scene;
        this.stage = stage;

        this.worker = new WorkerLoader(this.config, 'DataWorker');
        this.history = new History(this);
        this.state = {
            time: -1,
            canvas: new Uint8Array(this.config._canvas.width * this.config._canvas.height)
        };

        this.init = new Promise(async function (resolve) {
            await this.addCanvas();
            await this.addVoxels();
            await this.update();

            this.animate = this.animate.bind(this);
            requestAnimationFrame(this.animate);

            resolve(this);
        }.bind(this));
    }

    async animate() {
        if (this.state.time !== this.config.time) {
            const pixels = (await this.worker.execute({ 'getPixels': { arguments: [this.config.time] } }))[0];

            // update color 
            for (let i = 0, l = pixels.canvas.length; i < l; i++) {
                if (pixels.canvas[i] !== this.state.canvas[i]) {
                    const color = rgbColor(pixels.colors[pixels.canvas[i]]);
                    this.history.setColor(color, i);
                }
            }

            // update geometry
            await this.history.update();

            // save current state
            this.state.time = pixels.time;
            this.state.canvas = pixels.canvas;
        }

        // request frame
        requestAnimationFrame(this.animate);
    }

    async addCanvas() {
        const geometry = new THREE.PlaneGeometry(this.config._canvas.width, this.config._canvas.height);
        const material = new THREE.MeshLambertMaterial({ color: this.config.color.canvas, side: THREE.DoubleSide });
        this.canvas = new THREE.Mesh(geometry, material);

        // add to scene
        this.scene.add(this.canvas);
        setLayer(this.canvas, this.stage.layer.canvas);
    }

    async addVoxels() {
        await this.history.init;
        const material = new THREE.MeshPhongMaterial({ vertexColors: true });
        this.voxels = new THREE.Mesh(this.history.mergedGeometry, material);

        // add to scene
        this.scene.add(this.voxels);
        setLayer(this.voxels, this.stage.layer.voxels);
    }

    async update() {
        if (!this.canvas) {
            return;
        }

        // update canvas color
        this.canvas.material.color.setHex(this.config.color.canvas);
    }

    async export(zip) {
        // TODO
    }

    async reset() {
        // TODO
    }
}