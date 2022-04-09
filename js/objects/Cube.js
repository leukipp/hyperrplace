class Cube {
    constructor(canvas, index, position, color) {
        this.root = canvas.root;
        this.config = canvas.config;
        this.loader = canvas.loader;
        this.scene = canvas.scene;
        this.stage = canvas.stage;
        this.place = canvas.place;
        this.canvas = canvas;

        this.index = index;
        this.position = position;
        this.color = color;

        this.material = new THREE.MeshPhongMaterial({
            color: color,
            emissive: color,
            shininess: 0.9
        });

        this.loaded = new Promise(async function (resolve) {
            await this.addBox();
            await this.update();

            resolve(this);
        }.bind(this));
    }

    async addBox() {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        this.box = new THREE.Mesh(geometry, this.material.clone());

        // add to scene
        this.scene.add(this.box);
        setLayer(this.box, this.stage.layer.boomOff);
    }

    async turnOn() {
        // move to boom layer
        setLayer(this.box, this.stage.layer.boomOn);
    }

    async turnOff() {
        // move to shader layer
        setLayer(this.box, this.stage.layer.boomOff);
    }

    async update() {
        if (!this.box) {
            return;
        }

        // update color
        this.box.material.color.setHex(this.color);
        this.box.material.emissive.setHex(this.color);

        // shift coordinate system (canvas is centered at [0,0,0])
        const width = this.canvas.width;
        const height = this.canvas.height;
        const offset = new THREE.Vector3(0.5 - width / 2, 0.5 - height / 2, 0.5 + 0.01)

        // add offset and invert y axis (data origin is at top-left corner)
        const position = this.position;
        position.add(offset);
        position.y = -position.y

        // update position
        this.box.position.copy(position);
    }

    async export(zip) {
        // TODO
    }

    async reset() {
        // TODo
    }
}