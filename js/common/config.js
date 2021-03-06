const presets = [
    '2017',
    '2022'
];

const getPreset = async () => {
    // load preset from url
    const hash = getHash();
    if (hash.preset) {
        return hash.preset;
    }

    // using default preset
    return presets[0];
};

const getConfig = async (preset) => {
    return new Promise(async (resolve) => {
        fetch(`config/${preset}.json`).then((response) => response.json()).then(async (config) => {
            // get config from hash
            const hash = getHash();

            // set config from hash
            await setConfig(config, hash);

            // set preset
            config.preset = preset;

            // resolve promise
            resolve(config);
        }).catch(async () => {
            // resolve promise using default preset
            return resolve(await getConfig(presets[0]));
        });
    });
};

const setConfig = async (config, update) => {
    // previous config
    const prevConfig = cloneObject(config);
    delete prevConfig.next;

    // update config values
    const next = jsonParse(update.next) || 0;
    for (const key in update) {
        if (key != 'preset') {
            let value = jsonParse(update[key]);

            // array values based on next index
            if (getType(value) === 'array') {
                const idx = clamp(next, 0, value.length - 1);
                value = value[idx];
            }

            // update config value
            setProperty(config, key.split('.'), value);
        }
    }

    // update color values
    for (key in config._color) {
        const value = config._color[key];
        if (getType(value) === 'string') {
            config._color[key] = parseInt(value, 16);
        }
    }

    // next config
    const nextConfig = cloneObject(config);
    delete nextConfig.next;

    return !objectEquals(prevConfig, nextConfig);
};

const getHash = (key) => {
    const url = new URL(window.location.href.replace(/#/g, '&').replace('&', '?'));
    const params = Object.fromEntries(url.searchParams);
    return key ? params[key] : params;
};

const setHash = (key, value) => {
    const hash = getHash();
    hash[key] = value;
    window.location.hash = Object.keys(hash).map((key) => `${key}=${hash[key]}`).join('&');
};