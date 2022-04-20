class View {
    constructor(root, config, presets) {
        this.root = root;
        this.config = config;
        this.presets = presets;

        // init stage
        this.stage = new StageObject(this);
        this.stage.init.then(async () => {

            // init place
            this.place = new PlaceObject(this.stage);
            this.place.init.then(async () => {

                // init controls
                await this.controls(this.root.querySelector('#controls'));

                // init events
                window.addEventListener('hashchange', async (event) => {
                    await this.update(event);
                });
                await this.update({ type: 'loaded' });
            });
        });
    }

    async controls(root) {

        // gui root
        this.gui = new lil.GUI({ autoPlace: false, width: 320 });
        root.append(this.gui.domElement);

        // settings
        this.gui.add(this.config, 'preset', this.presets).name('Data').onChange((preset) => {
            setHash('preset', preset);
            window.location.reload();
        }).listen();
        this.gui.add(this.config, 'time', this.config._data.times.min, this.config._data.times.max, 1).name('Time').onChange((v) => {
            this.place.update();
        }).listen();

        // actions
        this.gui.add(this, 'export');
        this.gui.add(this, 'reset');
    }

    async update(event) {

        // get config from hash
        const hash = getHash();

        // set config from hash
        const changed = await setConfig(this.config, hash);

        // check event type
        const hashEvent = event.type === 'hashchange';
        const changeEvent = (hashEvent && changed);
        if (!changeEvent) {
            return;
        }

        // update place
        await this.place.update();
    }

    async export(date) {
        const zip = new JSZip();
        const zipName = `${this.stage.name}-${date || new Date().yyyymmddhhmmss()}.zip`;

        // export status
        this.stage.status('Exporting', 0);

        // add folders
        await this.stage.export(zip);
        await this.place.export(zip);

        // add config file
        zip.file('config.json', JSON.stringify(this.config, null, 4));

        // compression status
        this.stage.status('Compressing', 0);

        // generate zip file
        await zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 }
        }, (zipMeta) => {
            this.stage.status('Compressing', Math.round(zipMeta.percent));
        }).then((zipData) => {
            // compression finished
            this.stage.status();

            // download zip file
            saveAs(zipData, zipName);
        });
    }

    async reset() {
        await this.stage.reset();
        await this.place.reset();
    }
}

document.addEventListener('DOMContentLoaded', async () => {

    // load preset and config
    const preset = await getPreset();
    const config = await getConfig(preset);

    // init view
    new View(document.querySelector('#main'), config, presets);
});
