class Queue {
    constructor(maxsize = 0) {
        this.maxsize = maxsize;
        this.unfinishedTasks = 0;
        this.getters = [];
        this.putters = [];
        this.queue = [];
        this.finished = null;
    }
    async put(val) {
        while(this.full()){
            await new Promise((resolve) => {
                this.putters.push(resolve);
            })
        }
        return this.putNowait(val);
    }
    empty() {
	    return this.queue.length === 0;
    }
    putNowait(val) {
        if (this.queue.length === this.maxsize && this.maxsize) {
            throw new Error('Queue Full');
        }
        this.queue.push(val);
        this.unfinishedTasks++;
        this.wakeupNext(this.getters);
    }
    async get() {
        while(this.empty()) {
            await new Promise((resolve) => {
                this.getters.push(resolve);
            });
        }
        return this.getNowait();
    }
    getNowait() {
        var elm = this.queue.pop();
        if(elm === undefined) {
            throw new Error('Queue Empty');
        }
        this.wakeupNext(this.putters);
        return elm;
    }
    full() {
        return (this.queue.length >= this.maxsize) && (this.maxsize !== 0);
    }
    qsize() {
        return this.queue.length;
    }
    wakeupNext(waiters) {
        var waiter = waiters.pop();
        if(waiter){
            waiter();
        }
    }
    taskDone() {
        if (this.unfinishedTasks <= 0) {
            throw Error('taskDone called too many times');
        }
        this.unfinishedTasks--;
        if (this.unfinishedTasks === 0) {
            if (this.finished) {
                this.finished();
                this.finished = null;
            }
        }
    }
    async join() {
        if (this.unfinishedTasks > 0) {
            await new Promise((resolve) => {
                this.finished = resolve;
            });
        }
    }
}

module.exports.Queue = Queue;
