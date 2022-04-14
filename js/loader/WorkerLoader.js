class WorkerLoader {
    constructor(config, worker) {
        this.config = config;
        this.worker = worker;

        this.current = 0;
        this.workers = [];
        for (let i = 0, l = navigator.hardwareConcurrency; i < l; i++) {
            this.workers.push(new Worker(`js/worker/${this.worker}.js`));
        }
    }

    async execute(methods) {
        const promises = {};
        const callbacks = {};
        const messages = { config: this.config, methods: {} };

        for (const method in methods) {

            // build messages
            messages.methods[method] = { arguments: methods[method].arguments };

            // support callbacks and promises
            promises[method] = new Promise(async function (resolve) {
                callbacks[method] = (data) => {
                    if (methods[method].callback) {
                        methods[method].callback(data);
                    }
                    resolve(data);
                };
            });
        }

        // send worker messages
        this.workers[this.current].postMessage(messages);

        // receive worker messages
        this.workers[this.current].onmessage = ((e) => {
            for (const method in e.data) {
                const data = e.data[method];
                callbacks[method](data);
            }
        });

        // increment current worker
        // this.current = this.current + 1 >= this.workers.length ? 0 : this.current + 1;

        return Promise.all(Object.values(promises));
    }
}