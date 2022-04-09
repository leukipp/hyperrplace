class Canvas {
    constructor(place, index, width, height, color) {
        this.root = place.root;
        this.config = place.config;
        this.view = place.view;
        this.scene = place.scene;
        this.stage = place.stage;
        this.place = place;
        this.index = index;
        this.width = width;
        this.height = height;
        this.color = color;

        this.material = new THREE.MeshLambertMaterial({
            color: this.color,
            side: THREE.DoubleSide
        });

        this.data = new DataLoader(this);
        this.frame = this.config.frame;

        this.init = new Promise(async function (resolve) {
            await this.data.init;
            await this.mapColors();
            await this.mapTimes();

            await this.addPlane();
            await this.update();

            resolve(this);
        }.bind(this));
    }

    async mapColors() {
        const colors = await this.data.getColors();

        // create color mapping (id to rgb color)
        this.colorMap = {};
        colors.forEach((color, i) => {
            this.colorMap[i] = intColor(color);
        });
    }

    async mapTimes() {
        const times = await this.data.getTimes();

        // create time mapping (timestamp to pixel index)
        this.timeMap = {};
        times.forEach((time) => {
            this.timeMap[time[1]] = time[0];
        });
    }

    async addPlane() {
        const geometry = new THREE.PlaneGeometry(this.width, this.height);
        this.plane = new THREE.Mesh(geometry, this.material);

        // add to scene
        this.scene.add(this.plane);
        setLayer(this.plane, this.stage.layer.canvas);
    }

    async addVoxels(voxels) {
        const material = new THREE.MeshPhongMaterial({ vertexColors: true });
        const geometries = voxels.map((voxel) => voxel.geometry);
        const geometry = THREE.BufferGeometryUtils.mergeBufferGeometries(geometries);
        this.voxels = new THREE.Mesh(geometry, material);

        // add to scene
        this.scene.add(this.voxels);
        setLayer(this.voxels, this.stage.layer.voxels);
    }

    async setFrame(frame) {
        const idx = this.timeMap[frame];

        // TODO: handle non existing timestamps
        if (getType(idx) !== 'number') {
            return;
        }

        log("fetch start");

        const pixels = await this.data.getPixels(idx - 1e+6, idx + 1e+6);

        log("push start");

        const voxels = [];
        for (let i = 0; i < pixels.length; i++) {
            const [x1, y1, x2, y2, c] = pixels[i];
            const position = new THREE.Vector3(x1, y1, 0);
            const color = this.colorMap[c];

            // TODO: proper voxel index
            const voxel = new Voxel(this, i, position, color);
            await voxel.init;
            voxels.push(voxel);

            if (i > 100000) {
                break
            }
        }

        log("push end");

        this.addVoxels(voxels);

        log("draw end");
    }

    async update() {
        if (!this.plane) {
            return;
        }

        // update color
        this.plane.material.color.setHex(this.color);
    }

    async export(zip) {
        // TODO
    }

    async reset() {
        // TODO
    }
}