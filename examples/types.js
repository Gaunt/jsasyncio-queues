// @ts-check

const { Queue } = require("../queues");

/** @type {Queue<number>} */
var queue = new Queue();
queue.putNowait(1); // ok
queue.putNowait('') // Argument of type '""' is not assignable to parameter of type 'number'.