class FileLoader {
    constructor(canvas) {
        this.root = canvas.root;
        this.config = canvas.config;
        this.view = canvas.view;
        this.scene = canvas.scene;
        this.stage = canvas.stage;
        this.canvas = canvas;

        this.fetch = {
            zip: async (url) => {

                // load zip from url
                const binary = await JSZipUtils.getBinaryContent(url);
                const zip = await JSZip.loadAsync(binary);

                // load json from zip
                const files = {};
                for (const name in zip.files) {
                    const file = zip.files[name];
                    files[name] = jsonParse(await file.async('string'));
                }
                return files;
            },
            json: async (url) => {

                // load json from url
                return fetch(url).then((response) => response.json());
            }
        };

        this.cache = {};
    }

    async load(url) {

        // use cached result
        if (url in this.cache) {
            log('info', `serve ${url} from cache`);
            return this.cache[url];
        }

        return new Promise(async function (resolve) {
            const type = url.split('.').pop();

            // fetch data per type and cache results
            const data = await this.fetch[type](url);
            this.cache[url] = data;

            resolve(data);
        }.bind(this));
    }
}