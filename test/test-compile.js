// test compiling

var common = require('./common');
var assert = common.assert;
var whiskers = common.whiskers;

common.expected = 5;

assert.ok(whiskers.compile());
assert.ok(whiskers.compile('3'));
assert.ok(whiskers.compile(3));
assert.ok(whiskers.compile({p:3}));

var template = '{sue} and {sam} and {for x in nums}{x}{/for}';
var context = {
  sue: 'bob',
  sam: 'sal',
  nums: [1,2,3]
}

assert.equal(whiskers.compile(template)(context), 'bob and sal and 123');
