// @ts-check

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
