const assert = require('assert');
const sync = require('./synchronize');
const fs = require('fs');

require('./synchronize-bdd').replace();

describe('thing', function() {
  let data;
  before(function() {
    // We can load things in the before hook.
    data = sync.await(fs.readdir('../../data', 'utf-8', sync.defer()));
    if (Array.isArray(data)) {
        data = data.toString();
    }
  });

  it('should have data', function() {
    // We can arbitrarily yield in it blocks.
    sync.await(setImmediate(sync.defer()));

    assert(typeof data === 'string');
  });
});

