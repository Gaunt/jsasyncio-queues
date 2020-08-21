// @ts-check
const {Queue, sleep} = require('jsasyncio-queues');

/** @param {Queue<number>} queue */
async function worker(name, queue) {
    while (true) {
        var sleepFor = await queue.get();
        await sleep(sleepFor);
        queue.taskDone();
        console.log(`${name} has slept for ${sleepFor} seconds`);
    }
}

(async () => {
    /** @type {Queue<number>} */
    const queue = new Queue();
    var totalSleepTime = 0;

    // Generate random timings and put them into the queue.
    for(let i = 0; i < 20; i++) {
        let sleepFor = Math.random() + 0.05;
        totalSleepTime += sleepFor;
        queue.putNowait(sleepFor);
    }
    // Create three worker tasks to process the queue concurrently.
    var tasks = [0, 1, 2].map((i) => worker(`worker-${i}`, queue));

    // Wait until the queue is fully processed.
    const startedAt = Date.now();
    await queue.join();
    const totalSleptFor = (Date.now() - startedAt)/1000;

    console.log('====');
    console.log(`3 workers slept in parallel for ${totalSleptFor} seconds`);
    console.log(`total expected sleep time: ${totalSleepTime} seconds`);
})();