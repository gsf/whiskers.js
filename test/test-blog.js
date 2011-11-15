// test basic blog template

var fs = require('fs');
var common = require('./common');
var assert = common.assert;
var whiskers = common.whiskers;

common.expected = 1;

var template = fs.readFileSync('test/templates/blog.html', 'utf8');
var context = JSON.parse(fs.readFileSync('test/contexts/blog.json', 'utf8'));
var partials = {
  addComment: fs.readFileSync('test/templates/addComment.html', 'utf8'),
  comment: fs.readFileSync('test/templates/comment.html', 'utf8'),
  header: fs.readFileSync('test/templates/header.html', 'utf8'),
  footer: fs.readFileSync('test/templates/footer.html', 'utf8')
};

var rendered = whiskers.render(template, context, partials);

// uncomment to update expected
fs.writeFileSync('test/rendered/blog.html', rendered);

var renderedExpected = fs.readFileSync('test/rendered/blog.html', 'utf8');
assert.equal(rendered, renderedExpected, 'rendered and expected differ');
