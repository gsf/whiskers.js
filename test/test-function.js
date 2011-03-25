// test calling of function in context

var common = require('./common');
var assert = common.assert;
var render = common.whiskers.render;

common.expected = 2;

var context = {
  add2and2: function() {
    return 2+2;
  },
  another2: function(c) {
    return c.add2and2()+2;
  }
};

assert.equal(render('{add2and2}', context), '4');
assert.equal(render('{another2}', context), '6');
