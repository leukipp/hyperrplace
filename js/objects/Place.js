class Place {
    constructor(stage, index) {
        this.root = stage.root;
        this.config = stage.config;
        this.loader = stage.loader;
        this.scene = stage.scene;
        this.stage = stage;
        this.index = index;

        this.canvas = [];

        this.stage.status('Loading', 50);
        this.loaded = new Promise(async function (resolve) {
            await this.addCanvas();
            await this.update();

            resolve(this);
        }.bind(this));
    }

    async addCanvas() {
        const canvas = new Canvas(this, 0, this.config._canvas.size.width, this.config._canvas.size.height, this.config.color.canvas);
        await canvas.loaded;
        this.canvas.push(canvas);
    }

    async update() {
        // TODO
    }

    async export(zip) {
        const place = zip.folder('place');

        // TODO
    }

    async reset() {
        // TODO
    }
}