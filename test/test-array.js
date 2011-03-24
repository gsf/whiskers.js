// test for different possible array values

var common = require('./common');
var assert = common.assert;
var whiskers = common.whiskers;

common.expected = 5;

var template = '{for x in arr}{x}{/for}';

var context = {arr:[1,2,3]};
assert.equal(whiskers.render(template, context), '123')

context = {arr:'string'};
assert.equal(whiskers.render(template, context), 'string')

context = {arr:3};
assert.equal(whiskers.render(template, context), '')

context = {arr:{b:'orange'}};
assert.equal(whiskers.render(template, context), '')

context = {arr:function(){return [1,2,3]}};
assert.equal(whiskers.render(template, context), '123')
