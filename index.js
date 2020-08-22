const {Queue, LifoQueue, PriorityQueue, QueueFinished} = require('./src/queues');
const {sleep} = require('./src/utils');


module.exports.Queue = Queue;
module.exports.LifoQueue = LifoQueue;
module.exports.PriorityQueue = PriorityQueue;
module.exports.QueueFinished = QueueFinished;
module.exports.sleep = sleep;