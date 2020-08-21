var { sleep } = require('../src/utils')
var expect = require('chai').expect;
var assert = require('assert');

describe('utils', function () {
    describe('#sleep()', function () {
        it('should sleep for 0.01 second', async function () {
            var before = Date.now();
            await sleep(0.01);
            expect(Date.now() - before).to.be.greaterThan(10);
        });
    });
});
