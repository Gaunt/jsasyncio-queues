// @ts-check

var { Queue } = require('jsasyncio-queues');


/** @param {Queue<number>} queue */
async function producer(queue) {
    for (let i = 0; i < 5; i++) {
        await queue.put(i);
    }
    await queue.join();
}

/** @param {Queue<number>} queue */
async function consumer(queue) {
    while (true) {
        var item = await queue.get();
        console.log(`consumed ${item}`);
        queue.taskDone();
    }
}

(async () => {
    /** @type {Queue<number>} */
    const queue = new Queue();
    const prod = producer(queue);
    const cons = consumer(queue);
    await prod;
})();