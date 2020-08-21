// @ts-check

/** A queue inspired by python's asyncio.Queue,
 * useful for coordinating producer and consumer coroutines. 
 * @template T
 */
class Queue {
    /**
    * Creates a queue with a maximum number of elements in maxsize.
    * If not specified, the queue can hold an unlimited number of items.
    * @param {number} maxsize
    */
    constructor(maxsize = 0) {
        this.maxsize = maxsize;
        this.unfinishedTasks = 0;
        this.getters = [];
        this.putters = [];
        this.joiners = [];
        this.queue = [];
        this.finished = null;
    }
    /** @returns {boolean} - true if the queue is empty. */
    empty() {
        return this.queue.length === 0;
    }
    /** Put an item into the queue. If the queue is full, wait until a free
    *   slot is available before adding item.
    *   @param {T} item
    */
    async put(item) {
        while (this.full()) {
            await new Promise((resolve) => {
                this.putters.push(resolve);
            })
        }
        return this.putNowait(item);
    }
    /** Put an item into the queue without blocking.
    * If no free slot is immediately available, throws. 
    * @param {T} item    
    */
    putNowait(item) {
        if (this.queue.length === this.maxsize && this.maxsize) {
            throw new Error('Queue Full');
        }
        this.queue.push(item);
        this.unfinishedTasks++;
        this.wakeupNext(this.getters);
    }
    /** Remove and return an item from the queue.
    * If queue is empty, wait until an item is available. 
    * @returns {Promise<T>}    
    */
    async get() {
        while (this.empty()) {
            await new Promise((resolve) => {
                this.getters.push(resolve);
            });
        }
        return this.getNowait();
    }
    /** Remove and return an item from the queue.
    * Return an item if one is immediately available, else throws.
    * @returns {T}
    */
    getNowait() {
        var elm = this.queue.shift();
        if (elm === undefined) {
            throw new Error('Queue Empty');
        }
        this.wakeupNext(this.putters);
        return elm;
    }
    /** @returns {boolean} - true if the queue is full. */
    full() {
        return (this.queue.length >= this.maxsize) && (this.maxsize !== 0);
    }
    /** @returns {number} - number of items currently in the queue. */
    qsize() {
        return this.queue.length;
    }
    /** Indicate that a formerly enqueued task is complete.

        Used by queue consumers. For each get() used to fetch a task,
        a subsequent call to taskDone() tells the queue that the processing
        on the task is complete.

        If a join() is currently blocking, it will resume when all items have
        been processed (meaning that a taskDone() call was received for every
        item that had been put() into the queue).

        throws if called more times than there were items placed in
        the queue. */
    taskDone() {
        if (this.unfinishedTasks <= 0) {
            throw Error('taskDone called too many times');
        }
        this.unfinishedTasks--;
        if (this.unfinishedTasks === 0) {
            while (this.joiners.length) {
                this.wakeupNext(this.joiners);
            }
        }
    }
    /** Block until all items in the queue have been gotten and processed.

        The count of unfinished tasks goes up whenever an item is added to the
        queue. The count goes down whenever a consumer calls taskDone() to
        indicate that the item was retrieved and all work on it is complete.
        When the count of unfinished tasks drops to zero, join() unblocks. */
    async join() {
        if (this.unfinishedTasks > 0) {
            await new Promise((resolve) => {
                this.joiners.push(resolve);
            });
        }
    }
    wakeupNext(waiters) {
        var waiter = waiters.shift();
        if (waiter) {
            waiter();
        }
    }
}

module.exports.Queue = Queue;
