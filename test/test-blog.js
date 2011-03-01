var fs = require('fs');
var selleck = require('../lib/selleck');

var template = fs.readFileSync('test/templates/blog.html', 'utf8');
var context = require('./contexts/blog').context;
var partials = {
  comment: fs.readFileSync('test/templates/comment.html', 'utf8')
};

//var compiled = selleck.compile(template, partials);
//console.log(compiled);

var rendered = selleck.render(template, context, partials);
console.log(rendered);
