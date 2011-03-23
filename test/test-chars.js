// test for troubling characters

var common = require('./common');
var assert = common.assert;
var whiskers = common.whiskers;

common.expected = 4;

assert.equal(whiskers.render('\\'), '\\');
assert.equal(whiskers.render('\''), '\'');
assert.equal(whiskers.render('\\\''), '\\\'');
assert.equal(whiskers.render('\\\'{vehicle}', {vehicle:'truck'}), '\\\'truck');
