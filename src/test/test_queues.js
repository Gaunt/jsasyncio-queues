var { Queue, LifoQueue, PriorityQueue } = require('../queues')
var expect = require('chai').expect;
var assert = require('assert');


describe('Queue', function () {
    var q1 = new Queue(3);
    beforeEach(function () {
        q1 = new Queue(3);
        q1.putNowait(1);
        q1.putNowait(2);
    });
    describe('#empty()', function () {
        it("Returns true if the queue is empty,", function () {
            var q = new Queue(3);
            expect(q.empty()).to.equal(true);
        });
        it("returns false otherwise", function () {
            var q = new Queue(3);
            q.putNowait(1)
            expect(q.empty()).to.equal(false);
        });
    });
    describe('#full()', function () {
        it("Return true if there are maxsize items in the queue", function () {
            var q = new Queue(1);
            q.putNowait(1)
            expect(q.full()).to.equal(true);
        });
        it(`if the Queue was initialized with maxsize=0 (the default), 
then full() is never true.`, function () {
            var q = new Queue(0);
            q.putNowait(1)
            expect(q.full()).to.equal(false);
        });
    });
    describe('#putNowait()', function () {
        var q2 = new Queue(2);
        beforeEach(function () {
            q2 = new Queue(2);
        });
        it("should put element into queue", function () {
            q2.putNowait(1);
            q2.putNowait(2);
            assert.deepEqual(q2.queue, [1, 2]);
        });
        it("should not allow to put more than maxsize", function () {
            q1.putNowait(3);
            assert.deepEqual(q1.queue, [1, 2, 3]);
            expect(() => q1.putNowait(4)).to.throw();
            assert.deepEqual(q1.queue, [1, 2, 3]);
        });
    });
    describe('#getNowait()', function () {
        it('should remove element from queue', function () {
            assert.deepEqual(q1.queue, [1, 2]);
            var elm = q1.getNowait();
            assert.equal(elm, 1);
            assert.deepEqual(q1.queue, [2]);
        });
        it('Return an item if one is immediately available, else raise QueueEmpty.', function () {
            var q = new Queue(1);
            expect(() => q.getNowait()).to.throw();
        });

    });
    describe('#qsize()', function () {
        it('Number of items in the queue.', function () {
            var q = new Queue(1);
            q.putNowait(1);
            expect(q.qsize()).to.equal(1);
        });
    });
    describe('#get()', function () {
        it('Remove and return an item from the queue.', async function () {
            assert.deepEqual(q1.queue, [1, 2]);
            var elm = await q1.get();
            assert.equal(elm, 1);
        });
        it('If queue is empty, wait until an item is available.', async function () {
            var q = new Queue(1);
            (async () => {
                q.putNowait('elm putted nowait');
            })();
            var elm = await q.get();
            expect(elm).to.equal('elm putted nowait');
            (async () => {
                q.put('elm putted');
            })();
            var elm = await q.get();
            expect(elm).to.equal('elm putted');
        })
    });
    describe('#put()', function () {
        it('Put an item into the queue.', async function () {
            assert.deepEqual(q1.queue, [1, 2]);
            await q1.put(3);
            assert.deepEqual(q1.queue, [1, 2, 3]);
        });
        it('If the queue is full, wait until a free slot is available before adding item.', async function () {
            var queue = new Queue(1);
            await queue.put(1);
            queue.put(2);
            queue.put(3);
            assert.deepEqual(queue.queue, [1]);
            var item = await queue.get();
            expect(item).to.equal(1);
            assert.deepEqual(queue.queue, [2]);
            item = await queue.get();
            expect(item).to.equal(2);
            assert.deepEqual(queue.queue, [3]);
        });
    });
    describe('#join()', function () {
        it("Block until all items in the queue have been gotten and processed.", async function () {
            var q = new Queue();
            var worker = (async () => {
                q.taskDone();
                expect(q.unfinishedTasks).to.equal(1);
                q.taskDone();
                expect(q.unfinishedTasks).to.equal(0);
            });
            for (const _ of [1, 2]) { // test twice to assure state is reset
                await q.put(1);
                await q.put(2);
                expect(q.unfinishedTasks).to.equal(2);
                worker();
                await q.join();
                expect(q.finished).to.equal(null);
                await q.join();
            }
        });
    });
    describe('#taskDone()', function () {
        it('should decrease number of unfinishedTasks', async function () {
            const queue = new Queue();
            expect(queue.unfinishedTasks).to.equal(0);
            await queue.put(1);
            expect(queue.unfinishedTasks).to.equal(1);
            await queue.get();
            queue.taskDone();
            expect(queue.unfinishedTasks).to.equal(0);
        });
        it('throws if called more times than there were items placed in the queue.',
            async function () {
                const queue = new Queue();
                await queue.put(1);
                await queue.get();
                queue.taskDone();
                expect(() => queue.taskDone()).to.throw('taskDone called too many times');
            });
    })
    describe('producer-consumer', function () {
        it('consumer should consume all items produced by producer', async function () {
            const queue = new Queue();
            const consumedItems = [];
            const producer = async (queue) => {
                for (let i = 0; i < 5; i++) {
                    await queue.put(i);
                }
                await queue.join();
            }
            const consumer = async (queue) => {
                while (true) {
                    consumedItems.push(await queue.get());
                    queue.taskDone();
                }
            }
            const prod = producer(queue);
            const cons = consumer(queue);
            await prod;
            expect(consumedItems).to.deep.equal([0, 1, 2, 3, 4]);
        });
    });
});


describe('LifoQueue', function () {
    it('retrieves most recently added entries first (last in, first out).', async function () {
        var queue = new LifoQueue(2);
        await queue.put(1);
        queue.put(2);
        queue.put(3);
        assert.deepEqual(queue.queue, [1, 2]);
        var item = await queue.get();
        expect(item).to.equal(2);
        assert.deepEqual(queue.queue, [1, 3]);
        item = await queue.get();
        expect(item).to.equal(3);
        assert.deepEqual(queue.queue, [1]);
    });
});


describe('PriorityQueue', function () {
    it('retrieves most recently added entries first (last in, first out).', async function () {
        var queue = new PriorityQueue(2);
        await queue.put(2);
        queue.put(1);
        queue.put(3);
        var item = await queue.get();
        expect(item).to.equal(1);
        item = await queue.get();
        expect(item).to.equal(2);
        item = await queue.get();
        expect(item).to.equal(3);
    });
});