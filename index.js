var async = require('./src/async'); // fiber block definder
var await = require('./src/await'); // regular promise a+ waiter (within fiber)

var dwait = require('./synchronize').await; // defer callback waiter (within fiber)
var defer = require('./synchronize').defer; // defer callback anchor (within dwait)

var asyncBdd = require('./synchronize-bdd'); // asynchronous bdd testing helpers (fiber wrappers for mocha and jasmine tests)

exports.async = async; // base block
exports.await = await; // regular waiter within block
exports.dwait = dwait;
exports.defer = defer;
exports.asyncBdd = asyncBdd;
