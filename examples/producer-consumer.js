// @ts-check

const { Queue } = require('jsasyncio-queues');


/** @param {Queue<number>} queue */
async function producer(queue) {
    for (let i = 0; i < 5; i++) {
        await queue.put(i);
    }
    await queue.join(); // waits until all tasks are processed
}

/** @param {Queue<number>} queue */
async function consumer(queue) {
    for await (let item of queue) {
        console.log(`consumed ${item}`);
        queue.taskDone();  // indicates task processing completition
    }
}

(async () => {
    /** @type {Queue<number>} */
    const queue = new Queue();
    const prod = producer(queue);
    const cons = consumer(queue);
    await prod;
    queue.finish();  // cancels awaiting consumer
})();
