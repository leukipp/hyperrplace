// https://github.com/mrdoob/three.js/blob/dev/src/geometries/BoxGeometry.js

class VoxelGeometry extends THREE.BufferGeometry {
    constructor(color, planes) {
        super();
        this.type = 'VoxelGeometry';

        // parameters
        color = rgbColor(color || 0xffffff);
        planes = planes || [0, 1, 2, 3, 4, 5];

        // dimensions
        const width = 1;
        const height = 1;
        const depth = 1;

        // segments
        const widthSegments = 1;
        const heightSegments = 1;
        const depthSegments = 1;

        // buffers
        const indices = [];
        const colors = [];
        const positions = [];
        const normals = [];
        const uvs = [];

        // helper variables
        let numberOfVertices = 0;

        // build each side of the box geometry
        buildPlane('z', 'y', 'x', - 1, - 1, depth, height, width, depthSegments, heightSegments, 0);    // px
        buildPlane('z', 'y', 'x', 1, - 1, depth, height, - width, depthSegments, heightSegments, 1);    // nx
        buildPlane('x', 'z', 'y', 1, 1, width, depth, height, widthSegments, depthSegments, 2);         // py
        buildPlane('x', 'z', 'y', 1, - 1, width, depth, - height, widthSegments, depthSegments, 3);     // ny
        buildPlane('x', 'y', 'z', 1, - 1, width, height, depth, widthSegments, heightSegments, 4);      // pz
        buildPlane('x', 'y', 'z', - 1, - 1, width, height, - depth, widthSegments, heightSegments, 5);  // nz

        // build geometry
        this.setIndex(indices);
        this.setAttribute('color', new THREE.Uint8BufferAttribute(colors, 3, true));
        this.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3, false));
        this.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3, false));
        this.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2, false));

        function buildPlane(u, v, w, udir, vdir, width, height, depth, gridX, gridY, planeIndex) {
            if (planes.indexOf(planeIndex) < 0) {
                return;
            }

            const segmentWidth = width / gridX;
            const segmentHeight = height / gridY;

            const widthHalf = width / 2;
            const heightHalf = height / 2;
            const depthHalf = depth / 2;

            const gridX1 = gridX + 1;
            const gridY1 = gridY + 1;

            let vertexCounter = 0;

            // generate vertices, normals and uvs
            const vector = new THREE.Vector3();

            for (let iy = 0; iy < gridY1; iy++) {
                const y = iy * segmentHeight - heightHalf;

                for (let ix = 0; ix < gridX1; ix++) {
                    const x = ix * segmentWidth - widthHalf;

                    // set values to correct vector component
                    vector[u] = x * udir;
                    vector[v] = y * vdir;
                    vector[w] = depthHalf;

                    // now apply vector to color buffer
                    colors.push(color.r, color.g, color.b);

                    // now apply vector to vertex buffer
                    positions.push(vector.x, vector.y, vector.z);

                    // set values to correct vector component
                    vector[u] = 0;
                    vector[v] = 0;
                    vector[w] = depth > 0 ? 1 : - 1;

                    // now apply vector to normal buffer
                    normals.push(vector.x, vector.y, vector.z);

                    // uvs
                    uvs.push(ix / gridX);
                    uvs.push(1 - (iy / gridY));

                    // counters
                    vertexCounter += 1;
                }
            }

            // generate indices
            for (let iy = 0; iy < gridY; iy++) {
                for (let ix = 0; ix < gridX; ix++) {
                    const a = numberOfVertices + ix + gridX1 * iy;
                    const b = numberOfVertices + ix + gridX1 * (iy + 1);
                    const c = numberOfVertices + (ix + 1) + gridX1 * (iy + 1);
                    const d = numberOfVertices + (ix + 1) + gridX1 * iy;

                    // faces
                    indices.push(a, b, d);
                    indices.push(b, c, d);
                }
            }

            // update total number of vertices
            numberOfVertices += vertexCounter;
        }
    }

    static fromJSON(data) {
        return new VoxelGeometry(data.width, data.height, data.depth, data.widthSegments, data.heightSegments, data.depthSegments);
    }
}