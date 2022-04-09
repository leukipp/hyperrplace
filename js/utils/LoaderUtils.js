class LoaderUtils {
    constructor(place) {
        this.root = place.root;
        this.config = place.config;
        this.view = place.view;
        this.scene = place.scene;
        this.stage = place.stage;
        this.place = place;

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
        if (url in this.cache) {
            return this.cache[url];
        }

        return new Promise(async function (resolve) {
            const type = url.split('.').pop();
            const data = await this.fetch[type](url);
            this.cache[url] = data;
            resolve(data);
        }.bind(this));
    }
}