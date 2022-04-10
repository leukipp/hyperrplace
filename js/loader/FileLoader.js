class FileLoader {
    constructor(config) {
        this.config = config

        this.fetch = {
            zip: async (url) => {

                // load zip from url
                const binary = await fetch(url).then((response) => response.blob());
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
        const cache = await this.loadCache(url);
        if (cache) {
            return cache;
        }
        return this.loadRemote(url);
    }

    async loadCache(url) {
        if (url in this.cache) {
            log('debug', `serve ${url} from cache`);

            // use cached results
            return this.cache[url];
        }
        return;
    }

    async loadRemote(url) {
        return new Promise(async function (resolve) {
            log('debug', `serve ${url} from remote`);

            // fetch data per type and cache results
            const type = url.split('.').pop();
            const data = await this.fetch[type](url);
            // this.cache[url] = data;

            resolve(data);
        }.bind(this));
    }
}