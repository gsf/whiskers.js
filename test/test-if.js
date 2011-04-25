// test if tag

var common = require('./common');
var assert = common.assert;
var render = common.whiskers.render;

common.expected = 11;

var context = {foo:'bar'};
assert.equal(render('{if foo}{foo}{/if}', context), 'bar');
assert.equal(render('{if biz}{foo}{/if}', context), '');
assert.equal(render('{if not foo}{foo}{/if}', context), '');
assert.equal(render('{if not biz}{foo}{/if}', context), 'bar');
assert.equal(render('{if foo}{foo}{else}bim{/if}', context), 'bar');
assert.equal(render('{if biz}{foo}{else}bim{/if}', context), 'bim');

// stub out console.warn
var temp = console.warn;
var warnings = [];
console.warn = function(message) {
  warnings.push(message);
};

assert.equal(render('{if biz}{foo}{else}bim{else}bam{/if}', context), 'bimbam');

var template = '{else}{if biz}{foo}{else}bim{else}bam{/if}{else}{if fob}{else}';
assert.equal(render(template, context), 'bimbam');

var template = '{else}{if biz}{foo}{else}bim{if foo}bam{else}bom{else}';
assert.equal(render(template, context), 'bimbam');

var template = '{if foo}{foo}{if biz}{foo}{else}bim{/if}{else}bom{else}';
assert.equal(render(template, context), 'barbim');

assert.equal(warnings.length, 12);

// return to normal
console.warn = temp;
