const rad = (deg) => {
    return deg * Math.PI / 180;
};

const clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
};

const sleep = (ms) => {
    return new Promise(async (resolve) => setTimeout(resolve, ms));
};

const validUrl = (str) => {
    return !!new RegExp('^(?:(?:https?|fs):\/\/)', 'i').test(str);
};

const objectEquals = (obj1, obj2) => {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
};

const cloneObject = (obj) => {
    return jsonParse(JSON.stringify(obj));
};

const getType = (value) => {
    const str = Object.prototype.toString.call(value);
    return str.slice(8, -1).toLowerCase();
};

const setLayer = (object, layer) => {
    object.layers.set(layer);
    object.traverse((o) => { o.layers.set(layer); });
};

const onLayer = (object, layer) => {
    const testLayer = new THREE.Layers();
    testLayer.set(layer);
    const check = ['Mesh', 'AxesHelper'];
    return check.includes(object.type) ? testLayer.test(object.layers) : null;
};

const canvasImage = (canvas) => {
    const dataUrl = canvas.toDataURL('image/png');
    return dataUrl.substr(dataUrl.indexOf(',') + 1);
};

const truncatedMean = (values, percent) => {
    const outliers = Math.ceil(values.length * percent);
    const sorted = values.slice().sort((a, b) => a - b).slice(outliers, -outliers);
    const results = sorted.length ? sorted : values.slice();
    return results.reduce((a, b) => a + b) / results.length;
};

const hexColor = (color) => {
    return '#' + color.toString(16).padStart(6, '0');
};

const intColor = (color) => {
    if (getType(color) === 'string') {
        return parseInt(color.replace('#', '0x'), 16);
    }
    else if (getType(color) === 'array') {
        return ((color[0] & 0x0ff) << 16) | ((color[1] & 0x0ff) << 8) | (color[2] & 0x0ff);
    }
    else if (getType(color) === 'object') {
        return ((color.r & 0x0ff) << 16) | ((color.g & 0x0ff) << 8) | (color.b & 0x0ff);
    }
    return parseInt(color);
};

const rgbColor = (color) => {
    return {
        r: (color & 0xff0000) >> 16,
        g: (color & 0x00ff00) >> 8,
        b: (color & 0x0000ff)
    };
};

const setProperty = (object, path, value) => {
    if (path.length === 1) {
        object[path[0]] = value;
    }
    else if (path.length === 0) {
        throw error;
    }
    else {
        if (object[path[0]]) {
            return setProperty(object[path[0]], path.slice(1), value);
        }
        else {
            object[path[0]] = {};
            return setProperty(object[path[0]], path.slice(1), value);
        }
    }
};

const jsonParse = (value) => {
    try {
        return JSON.parse(value);
    }
    catch {
        return value;
    }
};

const doubleClick = (callback) => {
    let states = ['pointerdown', 'pointerup', 'pointerdown', 'pointerup'];
    let click, which, state;
    let reset = () => {
        click = false;
        which = -1;
        state = 0;
    };
    reset();
    return (e) => {
        if (state === 0) {
            which = e.which;
        }
        if (e.type === states[state] && which === e.which) {
            state = state < 3 ? state + 1 : 0;
        }
        else {
            reset();
        }
        if (states[state] === 'pointerup') {
            if (!click) {
                click = true;
                setTimeout(reset, 300);
            }
            else {
                reset();
                callback(e);
            }
        }
    };
};

const log = (...args) => {
    let level = 'log';
    let entries = Array.from(args);
    if (entries.length > 0 && getType(entries[0]) === 'string') {
        if (['debug', 'info', 'warn', 'error'].includes(entries[0])) {
            level = entries.shift();
        }
    }
    switch (level) {
        case 'debug':
            console.debug.apply(console, entries);
            break;
        case 'info':
            console.info.apply(console, entries);
            break;
        case 'warn':
            console.warn.apply(console, entries);
            break;
        case 'error':
            console.error.apply(console, entries);
            break;
        default:
            console.log.apply(console, entries);
    }
};

Array.prototype.chunk = function (size) {
    const result = [];
    while (this.length) {
        result.push(this.splice(0, size));
    }
    return result;
};

Date.prototype.yyyymmddhhmmss = function () {
    const yyyy = this.getFullYear();
    const mm = this.getMonth() < 9 ? '0' + (this.getMonth() + 1) : (this.getMonth() + 1);
    const dd = this.getDate() < 10 ? '0' + this.getDate() : this.getDate();
    const hh = this.getHours() < 10 ? '0' + this.getHours() : this.getHours();
    const min = this.getMinutes() < 10 ? '0' + this.getMinutes() : this.getMinutes();
    const sec = this.getSeconds() < 10 ? '0' + this.getSeconds() : this.getSeconds();
    return yyyy + '-' + mm + '-' + dd + '-' + hh + '-' + min + '-' + sec;
};