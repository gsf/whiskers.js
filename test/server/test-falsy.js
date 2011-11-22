// test for falsy values

var common = require('./common');
var assert = common.assert;
var whiskers = common.whiskers;

common.expected = 8;

var context = {
  zero: 0,
  'false': false,
  empty: ''
};

assert.equal(whiskers.render('{zero}', context), '0');
assert.equal(whiskers.render('{false}', context), 'false');
assert.equal(whiskers.render('{empty}', context), '');
assert.equal(whiskers.render('{undefined}', context), '');

assert.equal(whiskers.render('{if zero}{zero}{/if}', context), '');
assert.equal(whiskers.render('{if false}{false}{/if}', context), '');
assert.equal(whiskers.render('{if not zero}{zero}{/if}', context), '0');
assert.equal(whiskers.render('{if not false}{false}{/if}', context), 'false');
