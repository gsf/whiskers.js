// test basic blog template

var fs = require('fs');
var common = require('./common');
var assert = common.assert;
var selleck = require('../lib/selleck');

common.expected = 2;

var template = fs.readFileSync('test/templates/blog.html', 'utf8');
var context = require('./contexts/blog').context;
var partials = {
  comment: fs.readFileSync('test/templates/comment.html', 'utf8'),
  addcomment: fs.readFileSync('test/templates/addcomment.html', 'utf8')
};

var rendered = selleck.render(template, context, partials);
var compiled = selleck.compile(template, partials);

// uncomment to update expected
//fs.writeFileSync('test/compiled/blog.js', compiled);
//fs.writeFileSync('test/rendered/blog.html', rendered);

var renderedExpected = fs.readFileSync('test/rendered/blog.html', 'utf8');
assert.equal(rendered, renderedExpected, 'rendered and expected differ');
var compiledExpected = fs.readFileSync('test/compiled/blog.js', 'utf8');
assert.equal(compiled, compiledExpected, 'compiled and expected differ');
