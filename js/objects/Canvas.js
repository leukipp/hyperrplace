class Canvas {
    constructor(place, index, width, height, color) {
        this.root = place.root;
        this.config = place.config;
        this.loader = place.loader;
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

        this.cubes = [];

        this.loaded = new Promise(async function (resolve) {
            await this.addPlane();
            await this.update();

            resolve(this);
        }.bind(this));
    }

    async addPlane() {
        const geometry = new THREE.PlaneGeometry();
        geometry.rotateX(rad(90));

        this.plane = new THREE.Mesh(geometry, this.material);
        this.plane.scale.set(this.width, 1, this.height);

        // add to scene
        this.scene.add(this.plane);
        setLayer(this.plane, this.stage.layer.canvas);
    }

    async addCube(position, color) {
        const cube = new Cube(this, position, color)
        this.cubes.push(cube);
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