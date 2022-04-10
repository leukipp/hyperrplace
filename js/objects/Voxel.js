class Voxel {
    constructor(config, index, position, color) {
        this.config = config;
        this.index = index;
        this.position = position;
        this.color = rgbColor(color);

        // init geometry
        this.geometry = new THREE.BoxGeometry();
        this.geometry.userData['index'] = this.index;
        this.geometry.userData['position'] = cloneObject(this.position);
        this.geometry.userData['color'] = cloneObject(this.color);

        // set color attribute
        const colors = [];
        for (let i = 0; i < this.geometry.attributes.position.count; i++) {
            colors.push(this.color.r, this.color.g, this.color.b);
        }
        this.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        // shift coordinate system (canvas is centered at [0,0,0])
        const width = this.config._canvas.size.width;
        const height = this.config._canvas.size.height;
        const offset = new THREE.Vector3(0.5 - width / 2, 0.5 - height / 2, 0.5)

        // add offset and invert y axis (data origin is at top-left corner)
        this.position.add(offset);
        this.position.y = -this.position.y

        // set position attribute
        const rotation = new THREE.Euler(0, 0, 0);
        const scale = new THREE.Vector3(1, 1, 1);
        const quaternion = new THREE.Quaternion();
        quaternion.setFromEuler(rotation);

        const matrix = new THREE.Matrix4();
        matrix.compose(this.position, quaternion, scale);
        this.geometry.applyMatrix4(matrix);
    }
}