// test template recursion

var common = require('./common');
var assert = common.assert;
var render = common.whiskers.render;

common.expected = 1;

var context = {
  level: 1,
  children: [
    {
      level: 2,
      children: [
        {level: 3}
      ]
    }
  ]
};

var partials = {
  recurse: '{level}{for child in children}{>recurse}{/for}'
};

assert.equal(render('{>recurse}', context, partials), '4');
