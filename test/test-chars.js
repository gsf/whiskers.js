// test for troubling characters

var common = require('./common');
var assert = common.assert;
var whiskers = common.whiskers;

common.expected = 6;

assert.equal(whiskers.render('\\'), '\\');
assert.equal(whiskers.render('\''), '\'');
assert.equal(whiskers.render('\\\''), '\\\'');
assert.equal(whiskers.render('\\\'{vehicle}', {vehicle:'truck'}), '\\\'truck');
assert.equal(whiskers.render('bob\nsue'), 'bob\nsue');
assert.equal(whiskers.render('bob\r\nsue'), 'bob\nsue');
