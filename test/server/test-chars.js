// test for troubling characters

var common = require('./common');
var assert = common.assert;
var whiskers = common.whiskers;

common.expected = 11;

assert.equal(whiskers.render('\\'), '\\');
assert.equal(whiskers.render('\''), '\'');
assert.equal(whiskers.render('\\\''), '\\\'');
assert.equal(whiskers.render('\\\'{vehicle}', {vehicle: 'truck'}), '\\\'truck');
assert.equal(whiskers.render('bob\nsue'), 'bob\nsue');
assert.equal(whiskers.render('bob\r\nsue'), 'bob\nsue');
assert.equal(whiskers.render('{under_score}', {under_score: 'truck'}),
    'truck');
assert.equal(whiskers.render('{hyphenated-key}', {'hyphenated-key': 'truck'}),
    'truck');
assert.equal(whiskers.render('{@context}',
    {'@context': 'special tags in json-ld use at signs'}),
    'special tags in json-ld use at signs');
assert.equal(whiskers.render('{dc:title}',
    {'dc:title': 'special key in json-ld use compact IRI'}),
    'special key in json-ld use compact IRI');
assert.equal(whiskers.render('{dc:title.dc:topic}',
    {'dc:title': {'dc:topic': 'special key in json-ld use compact IRI'}}),
    'special key in json-ld use compact IRI');

