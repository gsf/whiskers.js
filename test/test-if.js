// test "if" tag

var common = require('./common');
var assert = common.assert;
var whiskers = common.whiskers;

common.expected = 5;

var context = {foo:'bar'};
assert.equal(whiskers.render('{?foo}{foo}{/foo}', context), 'bar');
assert.equal(whiskers.render('{?biz}{foo}{/biz}', context), '');
assert.equal(whiskers.render('{^foo}{foo}{/foo}', context), '');
assert.equal(whiskers.render('{^biz}{foo}{/biz}', context), 'bar');
assert.equal(whiskers.render('{?biz}blah{^biz}{foo}{/biz}', context), 'bar');
