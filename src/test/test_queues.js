var { Queue } = require('../queues')
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
            assert.equal(elm, 2);
            assert.deepEqual(q1.queue, [1]);
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
            assert.equal(elm, 2);
        });
        it('If queue is empty, wait until an item is available.', async function() {
            var q = new Queue(1);
            setTimeout(() => {
                q.putNowait('elm putted nowait');
            }, 0);
            var elm = await q.get();
            expect(elm).to.equal('elm putted nowait');
            setTimeout(() => {
                q.put('elm putted');
            }, 0);
            var elm = await q.get();
            expect(elm).to.equal('elm putted');
        })
    });
    describe('#put()', function () {
        it('Remove and return an item from the queue.', async function () {
            assert.deepEqual(q1.queue, [1, 2]);
            await q1.put(3);
            assert.deepEqual(q1.queue, [1, 2, 3]);
        });
        it('If queue is empty, wait until an item is available.', async function() {
            var q = new Queue(1);
            await q.put('first elm');
            assert.deepEqual(q.queue, ['first elm']);
            (async () => { // test with getNowait
                var elm = q.getNowait();
                expect(elm).to.equal('first elm');
            })();
            await q.put('second elm');
            assert.deepEqual(q.queue, ['second elm']);
            (async () => { // test with getNowait
                assert.deepEqual(q.queue, ['second elm']);
                expect(q.full()).to.equal(true);
                var elm = await q.get();
                expect(elm).to.equal('second elm');
                assert.deepEqual(q.queue, ['third elm']);
            })();
            await q.put('third elm');
            assert.deepEqual(q.queue, ['third elm']);
            var elm = await q.get();
            expect(elm).to.equal('third elm');
            expect(q.empty()).to.equal(true);
        });
    });
    describe('#join()', function() {
        it("Block until all items in the queue have been gotten and processed.", async function () {
            var q = new Queue();
            await q.put(1);
            await q.put(2);
            expect(q.unfinishedTasks).to.equal(2);
            (async () => {
                q.taskDone();
                expect(q.unfinishedTasks).to.equal(1);
                q.taskDone();
                expect(q.unfinishedTasks).to.equal(0);
            })();
            await q.join();
            expect(q.finished).to.equal(null);
            await q.join();
            await q.put(1);
            await q.put(2);
            expect(q.unfinishedTasks).to.equal(2);
            (async () => {
                q.taskDone();
                expect(q.unfinishedTasks).to.equal(1);
                q.taskDone();
                expect(q.unfinishedTasks).to.equal(0);
            })();
            await q.join();
            expect(q.finished).to.equal(null);
            expect(q.taskDone).to.throw();
        });
    });
});
