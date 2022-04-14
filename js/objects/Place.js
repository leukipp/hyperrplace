class Place {
    constructor(stage) {
        this.root = stage.root;
        this.config = stage.config;
        this.view = stage.view;
        this.scene = stage.scene;
        this.stage = stage;

        this.time = -1;
        this.color = this.config.color.canvas;
        this.worker = new WorkerLoader(this.config, 'DataWorker');
        this.history = new History(this);

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
        if (this.time !== this.config.time) {
            const pixels = (await this.worker.execute({ 'getPixels': { arguments: [this.config.time] } }))[0];

            console.time();

            for (let i = 0, l = pixels.canvas.length; i < l; i++) {
                const color = rgbColor(pixels.colors[pixels.canvas[i]]);

                // set color attribute
                this.history.setColor(color, i);
            }

            this.history.update();

            console.timeEnd();
        }

        // request frame
        await sleep(5000);
        requestAnimationFrame(this.animate);
    }

    async addCanvas() {
        const geometry = new THREE.PlaneGeometry(this.config._canvas.width, this.config._canvas.height);
        const material = new THREE.MeshLambertMaterial({ color: this.color, side: THREE.DoubleSide });
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
        this.canvas.material.color.setHex(this.color);
    }

    async export(zip) {
        // TODO
    }

    async reset() {
        // TODO
    }
}