// test logic tags

var common = require('./common');
var assert = common.assert;
var render = common.whiskers.render;

common.expected = 9;

var context = {foo:'bar', biz:[{x:'bot'}, {x:'bit'}]};

assert.equal(render('{?foo}{#biz}{foo}{x}{/biz}{/foo}', context), 'barbotbarbit');

// stub out console.warn
var temp = console.warn;
var warnings = [];
console.warn = function(message) {
  warnings.push(message);
};

assert.equal(render('{?baz}blah{^baz}{^baz}{foo}{/baz}', context), 'bar');
assert.equal(warnings[0], "extra {^baz} ignored");

assert.equal(render('{#biz}{x}{?foo}{/biz}{foo}{/foo}', context), 'botbarbitbar');
assert.equal(warnings[1], "extra {/biz} ignored");
assert.equal(warnings[2], "extra {#biz} closed at end of template");

assert.equal(render('{?foo}{#biz}{x}{/foo}{foo}{/biz}', context), 'botbarbitbar');
assert.equal(warnings[3], "extra {/foo} ignored");
assert.equal(warnings[4], "extra {?foo} closed at end of template");

// return to normal
console.warn = temp;
