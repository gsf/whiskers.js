// test templates

var common = require('./common');
var assert = common.assert;
var whiskers = common.whiskers;

common.expected = 6;

assert.equal(whiskers.render(), '');
assert.equal(whiskers.render('3'), '3');
assert.equal(whiskers.render(3), '3');
assert.equal(whiskers.render([1,2,3]), '1,2,3');
assert.equal(whiskers.render({p:3}), '[object Object]');
assert.equal(whiskers.render(function(){return 3}), 'function (){return 3}');
