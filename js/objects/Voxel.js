class Voxel {
    constructor(canvas, index, position, color) {
        this.root = canvas.root;
        this.config = canvas.config;
        this.view = canvas.view;
        this.data = canvas.data;
        this.scene = canvas.scene;
        this.stage = canvas.stage;
        this.place = canvas.place;
        this.canvas = canvas;
        this.index = index;
        this.position = position;
        this.color = color;

        this.material = new THREE.MeshPhongMaterial({
            vertexColors: true,
            shininess: 0.9
        });

        this.init = new Promise(async function (resolve) {
            await this.addCube();
            await this.update();

            resolve(this);
        }.bind(this));
    }

    async addCube() {
        this.geometry = new THREE.BoxGeometry(1, 1, 1);
        this.cube = new THREE.Mesh(this.geometry, this.material.clone());

        // add to scene
        //this.scene.add(this.cube);
        //setLayer(this.cube, this.stage.layer.voxels);
    }

    async update() {
        if (!this.cube) {
            return;
        }

        // update color
        const colors = [];
        const color = rgbColor(this.color);
        for (let i = 0; i < this.cube.geometry.attributes.position.count; i++) {
            colors.push(color.r, color.g, color.b);
        }
        this.cube.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        // shift coordinate system (canvas is centered at [0,0,0])
        const width = this.canvas.width;
        const height = this.canvas.height;
        const offset = new THREE.Vector3(0.5 - width / 2, 0.5 - height / 2, 0.5 + 0.01)

        // add offset and invert y axis (data origin is at top-left corner)
        const position = this.position;
        position.add(offset);
        position.y = -position.y

        // update position
        const rotation = new THREE.Euler(0, 0, 0);
        const scale = new THREE.Vector3(1, 1, 1);
        const quaternion = new THREE.Quaternion();
        quaternion.setFromEuler(rotation);

        const matrix = new THREE.Matrix4();
        matrix.compose(position, quaternion, scale);
        this.cube.geometry.applyMatrix4(matrix);
    }

    async export(zip) {
        // TODO
    }

    async reset() {
        // TODo
    }
}