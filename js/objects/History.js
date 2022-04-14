class History {
    constructor(place) {
        this.root = place.root;
        this.config = place.config;
        this.view = place.view;
        this.scene = place.scene;
        this.stage = place.stage;
        this.place = place;

        this.init = new Promise(async function (resolve) {
            await this.addVoxels();
            await this.update();

            resolve(this);
        }.bind(this));
    }

    mergeAttributes(name) {
        const attributes = this.mergedAttributes[name];
        const array = new Float32Array(attributes[0].length * attributes.length);
        const size = name === 'uv' ? 2 : 3;

        let offset = 0;
        for (let i = 0, l = attributes.length; i < l; ++i) {
            array.set(attributes[i], offset);
            offset += attributes[i].length;
        }

        return new THREE.BufferAttribute(array, size);
    }

    getColors(color) {

        // generate colors
        const colors = [];
        for (let i = 0, l = 24 * 3; i < l; i += 3) {
            colors.push(color.r / 255, color.g / 255, color.b / 255);
        }

        return colors;
    }

    getPositions(position) {

        // calculate position (data origin is at top-left corner)
        const x = position.x + this.origins.offset.x;
        const y = -position.y - this.origins.offset.y;
        const z = this.origins.offset.z;

        // generate positions
        const positions = [];
        for (let i = 0, l = 24 * 3; i < l; i += 3) {
            const point = this.origins.position.slice(i, i + 3);
            positions.push(point[0] + x, point[1] + y, point[2] + z);
        }

        return positions;
    }

    setColor(color, i) {
        this.mergedAttributes.color[i] = this.getColors(color);
    }

    setPosition(position, i) {
        this.mergedAttributes.position[i] = this.getPositions(position);
    }

    async addVoxels() {
        console.time();

        // merged geometry
        this.mergedGeometry = new THREE.BufferGeometry();

        // single geometry
        this.geometry = new THREE.BoxGeometry(1, 1, 1);
        this.geometry.setAttribute('color', new THREE.Float32BufferAttribute(this.getColors(rgbColor(this.config.color.canvas)), 3));

        // init origins
        this.origins = {
            offset: new THREE.Vector3(0.5 - this.config._canvas.width / 2, 0.5 - this.config._canvas.height / 2, 0.5),
            color: Array.from(this.geometry.attributes.color.array),
            position: Array.from(this.geometry.attributes.position.array),
            normal: Array.from(this.geometry.attributes.normal.array),
            uv: Array.from(this.geometry.attributes.uv.array)
        };

        // init merged attributes
        this.mergedAttributes = {};
        for (const name in this.geometry.attributes) {
            this.mergedAttributes[name] = [];
        }

        // init merged index
        this.mergedIndex = {
            offset: 0,
            index: []
        };

        // generate merged voxel geometry
        for (let i = 0, l = this.config._canvas.width * this.config._canvas.height; i < l; i++) {
            const position = {
                x: i % this.config._canvas.width,
                y: (i - i % this.config._canvas.width) / this.config._canvas.width
            };

            // merge attributes
            this.mergedAttributes.color.push(this.origins.color);
            this.mergedAttributes.position.push(this.getPositions(position));
            this.mergedAttributes.normal.push(this.origins.normal);
            this.mergedAttributes.uv.push(this.origins.uv);

            // merge index
            for (let j = 0, l = this.geometry.index.count; j < l; j++) {
                this.mergedIndex.index.push(this.geometry.index.array[j * this.geometry.index.itemSize] + this.mergedIndex.offset);
            }
            this.mergedIndex.offset += this.geometry.attributes.position.count;

            if (i >= 9) {
                //break;
            }
        }

        // set attributes
        for (const name in this.mergedAttributes) {
            this.mergedGeometry.setAttribute(name, this.mergeAttributes(name));
        }

        // set merged index
        this.mergedGeometry.setIndex(this.mergedIndex.index);

        console.timeEnd();
    }

    async update() {

        // update attributes
        this.mergedGeometry.setAttribute('color', this.mergeAttributes('color'));
        this.mergedGeometry.setAttribute('position', this.mergeAttributes('position'));
    }

    async export(zip) {
        // TODO
    }

    async reset() {
        // TODO
    }
}