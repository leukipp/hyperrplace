class Place {
    constructor(stage) {
        this.root = stage.root;
        this.config = stage.config;
        this.view = stage.view;
        this.scene = stage.scene;
        this.stage = stage;

        this.frame = -1;
        this.color = this.config.color.canvas;
        this.worker = new WorkerLoader(this.config, 'DataWorker');

        this.init = new Promise(async function (resolve) {
            await this.addCanvas();
            await this.update();

            this.animate = this.animate.bind(this);
            requestAnimationFrame(this.animate);

            resolve(this);
        }.bind(this));
    }

    async animate() {
        if (this.frame !== this.config.frame) {
            const voxels = await this.worker.execute({ 'getVoxels': { arguments: [this.config.frame] } });
            if (voxels[0]) {

                // update voxels
                await this.remVoxels();
                await this.addVoxels(voxels);

                // update current frame
                this.frame = this.config.frame;
            }
        }

        // request frame
        await sleep(100);
        requestAnimationFrame(this.animate);
    }

    async addCanvas() {
        const geometry = new THREE.PlaneGeometry(this.config._canvas.size.width, this.config._canvas.size.height);
        const material = new THREE.MeshLambertMaterial({ color: this.color, side: THREE.DoubleSide });
        this.canvas = new THREE.Mesh(geometry, material);

        // add to scene
        this.scene.add(this.canvas);
        setLayer(this.canvas, this.stage.layer.canvas);
    }

    async addVoxels(voxels) {
        const geometry = THREE.BufferGeometryUtils.mergeBufferGeometries(voxels);
        const material = new THREE.MeshPhongMaterial({ vertexColors: true });
        this.voxels = new THREE.Mesh(geometry, material);

        // add to scene
        this.scene.add(this.voxels);
        setLayer(this.voxels, this.stage.layer.voxels);
    }

    async remVoxels() {
        if (!this.voxels) {
            return;
        }

        // remove voxels
        this.scene.remove(this.voxels);
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