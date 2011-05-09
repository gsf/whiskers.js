// test logic tags

var common = require('./common');
var assert = common.assert;
var render = common.whiskers.render;

common.expected = 8;

var context = {foo:'bar', biz:['bot','bit']};

assert.equal(render('{if foo}{for x in biz}{foo}{x}{/for}{/if}', context), 'barbotbarbit');
assert.equal(render('{if biz}{for x in foo}{foo}{x}{/for}{/if}', context), 'barbbarabarr');

// stub out console.warn
var temp = console.warn;
var warnings = [];
console.warn = function(message) {
  warnings.push(message);
};

assert.equal(render('{for x in biz}{x}{if foo}{/for}{foo}{/if}', context), 'botbarbitbar');
assert.equal(warnings[0], "extra {/for} ignored");
assert.equal(warnings[1], "extra \"for\" closed at end of template");

assert.equal(render('{if foo}{for x in biz}{x}{/if}{foo}{/for}', context), 'botbarbitbar');
assert.equal(warnings[2], "extra {/if} ignored");
assert.equal(warnings[3], "extra \"if\" closed at end of template");

// return to normal
console.warn = temp;
