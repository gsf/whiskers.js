// test "for" tag

var common = require('./common');
var assert = common.assert;
var whiskers = common.whiskers;

common.expected = 15;

var template = '{#arr}{x}{/arr}';

assert.equal(whiskers.render(template, {}), '')

var context = {arr:[1,2,3]};
assert.equal(whiskers.render(template, context), '')

context = {arr:'string'};
assert.equal(whiskers.render(template, context), '')

context = {arr:3};
assert.equal(whiskers.render(template, context), '')

context = {arr:{b:'orange'}};
assert.equal(whiskers.render(template, context), '')

context = {arr:function(){return [1,2,3]}};
assert.equal(whiskers.render(template, context), '')

context = {arr:[{x:1}, {x:2}, {x:3}]};
assert.equal(whiskers.render(template, context), '123')


template = '{#arr}{x.y}{/arr}';

assert.equal(whiskers.render(template, {}), '')

context = {arr:[1,2,3]};
assert.equal(whiskers.render(template, context), '')

context = {arr:'string'};
assert.equal(whiskers.render(template, context), '')

context = {arr:{b:'orange'}};
assert.equal(whiskers.render(template, context), '')

context = {arr:[{y:1},{y:2},{y:3}]};
assert.equal(whiskers.render(template, context), '')

context = {arr:[{x:{y:1}},{x:{y:2}},{x:{y:3}}]};
assert.equal(whiskers.render(template, context), '123')


template = '{#arr}{#x}{y.z}{/x}{/arr}';

assert.equal(whiskers.render(template, {}), '')

context = {arr:[
            {x:[
              {y:{z:1}},
              {y:{z:2}}
            ]},
            {x:[
              {y:{z:3}}
            ]}
          ]};
assert.equal(whiskers.render(template, context), '123')
