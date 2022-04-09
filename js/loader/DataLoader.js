class DataLoader {
    constructor(canvas) {
        this.root = canvas.root;
        this.config = canvas.config;
        this.view = canvas.view;
        this.scene = canvas.scene;
        this.stage = canvas.stage;
        this.canvas = canvas;

        this.file = new FileLoader(canvas);

        this.init = new Promise(async function (resolve) {
            await this.mapIndex();
            resolve(this);
        }.bind(this));
    }

    async mapIndex() {
        this.index = await this.file.load('data/index.json');
    }

    async appendData(data, files) {
        for (const name in files) {
            data = data.concat(files[name].data);
        }
        return data;
    }

    async getData(type, from, to) {
        let data = [];

        // show loader
        this.stage.status(`Loading ${type}`, 0);

        // filter files
        let files = this.index[this.config.preset][type];
        if (from || to) {
            files = files.filter((file) => {
                const number = parseInt(file.split('.')[1], 10);
                return number >= (from || 0) && number <= (to || 1e+9);
            });
        }

        // fetch files
        for (let i = 0; i < files.length; i++) {
            const path = `data/${this.config.preset}/${type}/${files[i]}`;

            // load data
            data = await this.appendData(data, await this.file.load(path));

            // update loader
            this.stage.status(`Loading ${type}`, 100 * (i + 1) / files.length);
        }

        // hide loader
        this.stage.status(`Loading ${type}`, 100);

        return data;
    }

    async getPixels(from, to) {
        return this.getData('pixels', from, to);
    }

    async getUsers(from, to) {
        return this.getData('users', from, to);
    }

    async getTimes() {
        return this.getData('times');
    }

    async getColors() {
        return this.getData('colors');
    }
}