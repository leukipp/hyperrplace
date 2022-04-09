class Place {
    constructor(stage, index) {
        this.root = stage.root;
        this.config = stage.config;
        this.view = stage.view;
        this.scene = stage.scene;
        this.stage = stage;
        this.index = index;

        this.canvas = [];

        this.init = new Promise(async function (resolve) {
            await this.addCanvas();
            await this.update();

            resolve(this);
        }.bind(this));
    }

    async addCanvas() {
        const canvas = new Canvas(this, this.canvas.length, this.config._canvas.size.width, this.config._canvas.size.height, this.config.color.canvas);
        await canvas.init;
        this.canvas.push(canvas);
    }

    async update() {
        const frame = this.config.frame;

        // update canvas frame
        this.canvas.forEach(async (canvas) => {
            await canvas.setFrame(frame);
            await canvas.update();
        });
    }

    async export(zip) {
        // TODO
    }

    async reset() {
        // TODO
    }
}