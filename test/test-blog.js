var common = require('./common');
var assert = common.assert;
var fs = require('fs');
var selleck = require('../lib/selleck');

common.expected = 1;

var template = fs.readFileSync('test/templates/blog.html', 'utf8');
var context = require('./contexts/blog').context;
var partials = {
  comment: fs.readFileSync('test/templates/comment.html', 'utf8'),
  addcomment: fs.readFileSync('test/templates/addcomment.html', 'utf8')
};

var rendered = selleck.render(template, context, partials);
// uncomment to update expected
//fs.writeFileSync('test/compiled/blog.js', compiled);
//fs.writeFileSync('test/rendered/blog.html', rendered);
var renderedExpected = fs.readFileSync('test/rendered/blog.html', 'utf8');
assert.equal(rendered, renderedExpected, 'rendered and expected differ');
