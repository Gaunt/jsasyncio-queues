# jsasyncio-queues

Queues with API roughly inspired by python's asyncio.Queue, asyncio.LifoQueue, asyncio.PriorityQueue
useful for coordinating producer and consumer coroutines.

## Installation

```
npm i jsasyncio-queues
```

## Usage Examples

### Simple producer-consumer

```javascript
const { Queue } = require('jsasyncio-queues');

async function producer(queue) {
    for (let i = 0; i < 5; i++) {
        await queue.put(i);
    }
    await queue.join(); // waits until all tasks are processed
}

async function consumer(queue) {
    for await (let item of queue) {
        console.log(`consumed ${item}`);
        queue.taskDone();  // indicates task processing completition
    }
}

(async () => {
    const queue = new Queue();
    const prod = producer(queue);
    const cons = consumer(queue);
    await prod;
    queue.finish();  // cancels awaiting consumer
})();
```

### A reimplementation of the example from asyncio official documentation

```javascript
const {Queue, sleep} = require('jsasyncio-queues');

async function worker(name, queue) {
    while (true) {
        var sleepFor = await queue.get();
        await sleep(sleepFor);
        queue.taskDone();
        console.log(`${name} has slept for ${sleepFor} seconds`);
    }
}

(async () => {
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

### Cancellation

The queues support cancelation of awaiting consumer tasks. You can eather use async iteration as in the first example,
which ends when finish is called, or catch `QueueFinished` exception explicitly.

```javascript
const { Queue, QueueFinished } = require('jsasyncio-queues');

async function producer(queue) {
    for (let i = 0; i < 5; i++) {
        await queue.put(i);
    }
    await queue.join();
}

async function consumer(queue) {
    try {
        while (true) {
            var item = await queue.get();
            console.log(`consumed ${item}`);
            queue.taskDone();
        }
    }  catch (e) {
        if (!(e instanceof QueueFinished)) {
            throw e;
    }}
    console.log('Queue finished');
}

(async () => {
    const queue = new Queue();
    const prod = producer(queue);
    const cons = consumer(queue);
    await prod;
    queue.finish();
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

```javascript
var { LifoQueue } = require('jsasyncio-queues');

(async () => {
    var queue = new LifoQueue(2);
        await queue.put(2);
        queue.put(1);
        queue.put(3);
        var item = await queue.get();
        console.log(item); // 1
        item = await queue.get();
        console.log(item); // 3
        item = await queue.get();
        console.log(item); // 2
})();
```

### PriortyQueue

a priority queue, built on tinyqueue

```javascript
var { PriorityQueue } = require('jsasyncio-queues');

(async () => {
    var queue = new PriorityQueue(2);
        await queue.put(2);
        queue.put(1);
        queue.put(3);
        var item = await queue.get();
        console.log(item); // 1
        item = await queue.get();
        console.log(item); // 2
        item = await queue.get();
        console.log(item); // 3
})();

```

## Other functions

some other utility functions consistent with asyncio are reimplemented

### sleep

```javascript
const { sleep } = require("../queues");

(async (){
    await sleep(10); // sleep for 10 seconds
})();
```