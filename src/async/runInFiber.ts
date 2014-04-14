﻿import _refs = require('_refs');
import Fiber = require('fibers');
import RunContext = require('./runContext');
import Options = require('./options');
import CallbackArg = require('./callbackArg');
import ReturnValue = require('./returnValue');
export = runInFiber;


/**
 * The runInFiber() function accepts a RunContext instance, and calls the wrapped function
 * as specified in this context. The result of the call is used to resolve the context's
 * promise. If an exception is thrown, the context's promise is rejected. This function
 * must take all its information in a single argument (i.e. the RunContext), because it is
 * called via Fiber#run(), which accepts at most one argument.
 */
function runInFiber(runCtx: RunContext) {
    try {

        // Track the number of currently active fibers
        adjustFiberCount(+1);

        // Call the wrapped function. It may be suspended several times (at await and/or yield calls).
        var result = runCtx.wrapped.apply(runCtx.thisArg, runCtx.argsAsArray);

        // If we get here, the wrapped function finished normally (ie via explicit or implicit return).
        if (runCtx.options.callbackArg === CallbackArg.Required) {
            runCtx.callback(null, runCtx.options.isIterable ? { done: true } : result);
        }
        if (runCtx.options.returnValue === ReturnValue.Promise) {
            runCtx.resolver.resolve(runCtx.options.isIterable ? { done: true } : result);
        }
    }
    catch (err) {

        // If we get here, the wrapped function had an unhandled exception.
        if (runCtx.options.callbackArg === CallbackArg.Required) runCtx.callback(err);
        if (runCtx.options.returnValue === ReturnValue.Promise) runCtx.resolver.reject(err);
    }
    finally {

        // Track the number of currently active fibers
        adjustFiberCount(-1);

        // TODO: for semaphores
        runCtx.semaphore.leave();
    }
}


/**
 * The following functionality prevents memory leaks in node-fibers by actively managing Fiber.poolSize.
 * For more information, see https://github.com/laverdet/node-fibers/issues/169.
 */
function adjustFiberCount(delta: number) {
    activeFiberCount += delta;
    if (activeFiberCount >= fiberPoolSize) {
        fiberPoolSize += 100;
        Fiber.poolSize = fiberPoolSize;
    }
}
var fiberPoolSize = Fiber.poolSize;
var activeFiberCount = 0;