var fs = require('fs');
var selleck = require('../lib/selleck');

var template = fs.readFileSync('test/blog.html', 'utf8');

var context = {
  blog: {
    title: "Scrumptious lessons",
  },
  posts: [
    {
      title: 'A happy time',
      content: 'In my childhood I would laugh and play.',
      author: 'Hornsby Sumpin'
    },
    {
      title: 'Better days',
      content: 'Pals are a necessity in this lonely world.',
      author: 'Baffle McCough',
      comments: [
        {
          content: 'I stand in complete agreement.',
          author: 'Bitters Compote'
        },
        {
          content: 'What a baleful load of beeswax.',
          author: 'Gluglug Baldag'
        }
      ]
    }
  ]
};

var partials = {};

//var compiled = selleck.compile(template);
//console.log(eval(compiled));

var rendered = selleck.render(template, context, partials);
console.log(rendered);
