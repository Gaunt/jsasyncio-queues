# jsasyncio-queues

Queues inspired by python's asyncio.Queue, asyncio.LifoQueue, asyncio.PriorityQueue
useful for coordinating producer and consumer coroutines.

## Instalation

```
npm i jsasyncio-queues
```

## Examples

### Simple producer-consumer

```javascript
var { Queue } = require('jsasyncio-queues');

async function producer(queue) {
    for (let i = 0; i < 5; i++) {
        await queue.put(i);
    }
    await queue.join(); // wait for consumer to send taskDone for each consumed item
}

async function consumer(queue) {
    while (true) {
        var item = await queue.get();
        console.log(`consumed ${item}`);
        queue.taskDone();
    }
}

(async () => {
    const queue = new Queue();
    const prod = producer(queue);
    const cons = consumer(queue);
    await prod;
})();
```

### A reimplementation of the example from asyncio official documentation

```javascript
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
```
### ts type anotations support

```javascript
// @ts-check

const { Queue } = require("../queues");

/** @type {Queue<number>} */
var queue = new Queue();
queue.putNowait(1); // ok
queue.putNowait('') // Argument of type '""' is not assignable to parameter of type 'number'.
```

## Other Queue Types

### LifoQueue

the same interface as Queue, but retrieves most recently added entries first (last in, first out).

### PriortyQueue

a priority queue, built on tinyqueue

## Other Synchronization Primitives