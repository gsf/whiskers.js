// test calling of function in context

var fs = require('fs');
var common = require('./common');
var assert = common.assert;
var selleck = require('../lib/selleck');
var render = selleck.render;

common.expected = 1;

var context = {
  add2and2: function() {
    return 2+2;
  }
}
assert.equal(render('{add2and2}', context), '4');
