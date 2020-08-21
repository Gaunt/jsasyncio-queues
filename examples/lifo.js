// @ts-check

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
