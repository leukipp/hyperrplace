class DataUtils {
    constructor(place) {
        this.root = place.root;
        this.config = place.config;
        this.view = place.view;
        this.scene = place.scene;
        this.stage = place.stage;
        this.place = place;

        this.loader = new LoaderUtils(place);

        this.loaded = new Promise(async function (resolve) {
            this.index = await this.loader.load('data/index.json');
            resolve(this);
        }.bind(this));
    }

    async appendData(data, files) {
        for (const name in files) {
            data = data.concat(files[name].data);
        }
        return data;
    }

    async getData(type, from, to) {
        let data = [];

        const preset = this.config.preset;
        const files = this.index[preset][type];

        // show loader
        this.stage.status(`Loading ${type}`, 0);

        if (!from && !to) {
            // fetch all files
            for (let i = 0; i < files.length; i++) {
                const path = `data/${preset}/${type}/${files[i]}`;

                // load data
                data = await this.appendData(data, await this.loader.load(path));

                // update loader
                this.stage.status(`Loading ${type}`, 100 * (i + 1) / files.length);
            }
        } else {
            // TODO: fetch files for range
            // log(files);
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