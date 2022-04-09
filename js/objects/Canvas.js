class Canvas {
    constructor(place, index, width, height, color) {
        this.root = place.root;
        this.config = place.config;
        this.view = place.view;
        this.data = place.data;
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
            await this.addCubes();
            await this.update();
            resolve(this);
        }.bind(this));
    }

    async addPlane() {
        const geometry = new THREE.PlaneGeometry(this.width, this.height);
        this.plane = new THREE.Mesh(geometry, this.material);

        // add to scene
        this.scene.add(this.plane);
        setLayer(this.plane, this.stage.layer.canvas);
    }

    async addCube(index, position, color) {
        const cube = new Cube(this, index, position, color);
        await cube.loaded;
        this.cubes.push(cube);
    }

    async addCubes() {
        // TEST FULL DATA
        log(await this.data.getColors());
        log(await this.data.getTimes());

        // TEST RANGED DATA
        log(await this.data.getUsers(0, 100));
        log(await this.data.getPixels(0, 100));

        // TEST 1
        const position1 = new THREE.Vector3(0, 0, 0);
        const color1 = intColor({ r: 255, g: 2, b: 2 });
        this.addCube(0, position1, color1);

        // TEST 2
        const position2 = new THREE.Vector3(500, 500, 0);
        const color2 = intColor({ r: 9, g: 255, b: 2 });
        this.addCube(1, position2, color2);

        // TEST 3
        const position3 = new THREE.Vector3(999, 999, 0);
        const color3 = intColor({ r: 9, g: 2, b: 255 });
        this.addCube(2, position3, color3);
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