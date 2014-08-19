﻿import references = require('references');
import chai = require('chai');
import Promise = require('bluebird');
import async = require('asyncawait/async');
import await = require('asyncawait/await');
import yield_ = require('asyncawait/yield');
var expect = chai.expect;


describe('A suspendable function returned by async.promise(...)', () => {

    it('synchronously returns a promise', () => {
        var foo = async.promise (() => {});
        var syncResult = foo();
        expect(syncResult).instanceOf(Promise);
    });

    it('begins executing synchronously and completes asynchronously', done => {
        var x = 5;
        var foo = async.promise (() => { x = 7; });
        foo()
        .then(() => expect(x).to.equal(9))
        .then(() => done())
        .catch(done);
        expect(x).to.equal(7);
        x = 9;
    });

    it("preserves the 'this' context of the call", done => {
        var foo = { bar: async.promise (function () { return this; }) }, baz = {x:7};
        foo.bar()
        .then(result => expect(result).to.equal(foo))
        .then(() => foo.bar.call(baz))
        .then(result => expect(result).to.equal(baz))
        .then(() => done())
        .catch(done);
    });

    it('eventually resolves with its definition\'s returned value', done => {
        var foo = async.promise (() => { return 'blah'; });
        foo()
        .then(result => expect(result).to.equal('blah'))
        .then(() => done())
        .catch(done);
    });

    it('eventually rejects with its definition\'s thrown value', done => {
        var act, exp = new Error('Expected thrown value to match rejection value');
        var foo = async.promise (() => { throw exp; return 'blah'; });
        foo()
        .catch(err => act = err)
        .then(() => {
            if (!act) done(new Error("Expected function to throw"))
            else if (act !== exp) done(exp);
            else done();
        });
    });

    it('works with await', done => {
        var foo = async.promise (() => { return await (Promise.delay(20).then(() => 'blah')); });
        foo()
        .then(result => expect(result).to.equal('blah'))
        .then(() => done())
        .catch(done);
    });

    it('emits progress with each yielded value', done => {
        var foo = async.promise (() => { yield_(111); yield_(222); yield_(333); return 444; });
        var yields = [];
        foo()
        .progressed(value => yields.push(value))
        .then(result => expect(result).to.equal(444))
        .then(() => expect(yields).to.deep.equal([111,222,333]))
        .then(() => done())
        .catch(done);
    });
});