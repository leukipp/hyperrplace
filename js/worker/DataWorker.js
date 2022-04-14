importScripts(
    '../common/helper.js',
    '../libraries/three.min.js',
    '../libraries/jszip.min.js',
    '../loader/FileLoader.js'
);

class DataWorker {
    constructor(config) {
        this.config = config

        this.root = '../../data';
        this.loader = new FileLoader(this.config);

        this.map = {
            colors: new Uint32Array(this.config._data.colors),
            times: new Uint32Array(this.config._data.times.max - this.config._data.times.min + 1),
            pixels: {
                x: new Uint16Array(this.config._data.pixels),
                y: new Uint16Array(this.config._data.pixels),
                c: new Uint8Array(this.config._data.pixels)
            }
        };
        this.canvas = new Uint8Array(this.config._canvas.width * this.config._canvas.height);

        this.init = new Promise(async function (resolve) {
            this.index = await this.loader.load(`${this.root}/index.json`);

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
        for (let i = 0, l = files.length; i < l; i++) {
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
            const [index, timestamp] = time;
            if (timestamp >= this.config._data.times.min && timestamp <= this.config._data.times.max) {
                this.map.times[timestamp - this.config._data.times.min] = index;
            }
        });

        // forward fill unmapped timestamps
        for (let i = 1, l = this.map.times.length; i <= l; i++) {
            if (!this.map.times[i]) {
                this.map.times[i] = this.map.times[i - 1];
            }
        }
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
        const downloadChunks = 3;
        const downloadBatches = zipBatches.chunk(downloadChunks);

        // add first zip as single batch for faster data preview
        downloadBatches.unshift([[0, 0]]);

        // download zip as batches with multiple in parallel
        for (let i = 0, l = downloadBatches.length; i < l; i++) {
            const parallel = downloadBatches[i].map((fromTo) => this.getData('pixels', ...fromTo));
            const dates = await Promise.all(parallel);

            dates.forEach((data, j) => {
                const startIndex = downloadBatches[i][j][0];

                // extract pixel data (TODO: x2, y2 rect support)
                data.forEach((pixel, index) => {
                    const [x1, y1, x2, y2, c] = pixel;
                    this.map.pixels.x[startIndex + index] = x1;
                    this.map.pixels.y[startIndex + index] = y1;
                    this.map.pixels.c[startIndex + index] = c;
                });
            });
        }
    }

    async getPixels(time) {
        const index = this.map.times[time - this.config._data.times.min];

        // reset canvas
        this.canvas.fill(this.map.colors.indexOf(0xffffff));

        // update canvas
        for (let i = 0; i <= index; i++) {
            const x = this.map.pixels.x[i];
            const y = this.map.pixels.y[i];
            const c = this.map.pixels.c[i];
            this.canvas[x + this.config._canvas.width * y] = c;
        }

        // post message
        self.postMessage({
            getPixels: {
                time: time,
                canvas: this.canvas,
                colors: this.map.colors
            }
        });
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