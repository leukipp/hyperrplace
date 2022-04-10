importScripts(
    '../libraries/three.min.js',
    '../libraries/jszip.min.js',
    '../common/helper.js',
    '../objects/Voxel.js',
    '../loader/FileLoader.js',
    '../utils/BufferGeometryUtils.js'
);

class DataWorker {
    constructor(config) {
        this.config = config

        this.root = '../../data';
        this.loader = new FileLoader(this.config);

        this.init = new Promise(async function (resolve) {
            this.index = await this.loader.load(`${this.root}/index.json`);
            this.map = { colors: {}, times: {}, pixels: {} };

            await this.mapColors();
            await this.mapTimes();

            this.mapPixels();

            resolve(this);
        }.bind(this));
    }

    async getFiles(type) {
        return this.index[this.config.preset][type];
    }

    async appendData(data, files) {
        for (const name in files) {
            data = data.concat(files[name].data);
        }
        return data;
    }

    async getData(type, from, to) {
        let data = [];
        let files = await this.getFiles(type);

        // filter files by chunk number
        if (getType(from) == 'number' || getType(to) == 'number') {
            files = files.filter((file) => {
                const number = parseInt(file.split('.')[1], 10);
                return number >= (from || 0) && number <= (getType(to) == 'number' ? to : 1e+9);
            });
        }

        // fetch files and merge results
        for (let i = 0; i < files.length; i++) {
            const path = `${this.root}/${this.config.preset}/${type}/${files[i]}`;
            data = await this.appendData(data, await this.loader.load(path));
        }

        return data;
    }

    async mapColors() {
        const colors = await this.getData('colors');

        // create color mapping (id to rgb color)        
        colors.forEach((color, i) => {
            this.map.colors[i] = intColor(color);
        });
    }

    async mapTimes() {
        const times = await this.getData('times');

        // create time mapping (timestamp to pixel index)
        times.forEach((time) => {
            this.map.times[time[1]] = time[0];
        });
    }

    async mapPixels() {
        const files = await this.getFiles('pixels');
        const indices = files.map((file) => parseInt(file.split('.')[1], 10));

        // how many zips should be fetched sequential as merged batch
        const zipChunks = 2;
        const zipBatches = indices.slice(1).chunk(zipChunks).map((batch) => {
            return batch.filter((_, i) => (i == 0 || i == (zipChunks - 1)));
        });

        // how many of these batches should be fetched in parallel
        const downloadChunks = 2;
        const downloadBatches = zipBatches.chunk(downloadChunks);

        // add first zip as single batch for faster data preview
        downloadBatches.unshift([[0, 0]]);

        // download zip as batches with multiple in parallel
        for (let i = 0; i < downloadBatches.length; i++) {
            const parallel = downloadBatches[i].map((fromTo) => this.getData('pixels', ...fromTo));
            const dates = await Promise.all(parallel);

            dates.forEach((data, j) => {
                const startIndex = downloadBatches[i][j][0];

                // extract pixel data (TODO: x2, y2 rect support)
                data.forEach((pixel, index) => {
                    const [x1, y1, x2, y2, c] = pixel;
                    const position = new THREE.Vector3(x1, y1, 0);
                    const color = this.map.colors[c];

                    // generate voxel geometry
                    const voxel = new Voxel(this.config, startIndex + index, position, color);
                    this.map.pixels[voxel.index] = voxel.geometry;
                });
            });
        }
    }

    async getVoxels(frame) {
        let index = 0;
        Object.keys(this.map.times).forEach((timestamp) => {
            if (timestamp < frame) {
                index = this.map.times[timestamp];
            }
        });

        if (getType(index) === 'number') {

            // filter geometries by index
            const geometries = {};
            for (const i in this.map.pixels) {
                const geometry = this.map.pixels[i];
                const position = geometry.userData.position;

                // overwriting dictionary over same positions
                if (i < index) {
                    const key = `${position.x}-${position.y}`;
                    geometries[key] = geometry;
                }
            }

            // send to main thread
            if (Object.keys(geometries).length) {
                self.postMessage({ getVoxels: THREE.BufferGeometryUtils.mergeBufferGeometries(Object.values(geometries)) });
                return;
            }
        }

        // send to main thread
        self.postMessage({ getVoxels: null });
    }
}

self.onmessage = async (e) => {
    const config = e.data.config;
    const methods = e.data.methods;

    // init worker
    if (!this.worker) {
        this.worker = new DataWorker(config);
        await this.worker.init;
    }

    // execute worker methods
    for (const method in methods) {
        this.worker[method](...methods[method].arguments);
    }
};