// @ts-check

const { Queue, QueueFinished } = require('jsasyncio-queues');


/** @param {Queue<number>} queue */
async function producer(queue) {
    for (let i = 0; i < 5; i++) {
        await queue.put(i);
    }
    await queue.join();
}

/** @param {Queue<number>} queue */
async function consumer(queue) {
    try {
        while (true) {
            var item = await queue.get();
            console.log(`consumed ${item}`);
            queue.taskDone();
        }
    } catch (e) {
        if (e instanceof QueueFinished) {
            console.log('Queue finished');

        } else {
            throw e;
        }
    }
}

(async () => {
    /** @type {Queue<number>} */
    const queue = new Queue();
    const prod = producer(queue);
    const cons = consumer(queue);
    await prod;
    queue.finish();
})();
