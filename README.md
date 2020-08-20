# jsasyncio-queues

A queue inspired by python's asyncio.Queue,
useful for coordinating producer and consumer coroutines.

```javascript
var { Queue } = require('jsasyncio-queues');

async function producer(queue) {
    for (let i = 0; i < 5; i++) {
        await queue.put(i);
    }
    await queue.join();
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