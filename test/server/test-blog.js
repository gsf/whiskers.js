// test basic blog template

var fs = require('fs');
var common = require('./common');
var assert = common.assert;
var whiskers = common.whiskers;

common.expected = 1;

var template = fs.readFileSync('test/server/templates/blog.html', 'utf8');
var context = {
  blog: {
    title: "Scrumptious lessons"
  },
  posts: [
    {
      title: "A happy time",
      content: "<p>In my childhood I would laugh and play.</p>",
      author: "Hornsby Sumpin",
      tags: ["happy", "fun", "joy"]
    },
    {
      title: "Better days",
      content: "<p>Pals are a necessity in this lonely world.</p>",
      author: "Baffle McCough",
      tags: ["mirth", "briny", "pith"],
      comments: [
        {
          content: "I stand in complete agreement.",
          author: "Bitters Compote"
        },
        {
          content: "What a baleful load of beeswax.",
          author: "Gluglug Baldag"
        }
      ]
    },
    {
      title: "True madness",
      content: "<p>Let us begin again, as we were when we were babies.</p><p>Further and further from the truth we could never travel.</p>",
      tags: ["malaise"],
      comments: [
        {
          content: "I am comforted by our debate.",
          author: "Mildrand Brumpup"
        }
      ]
    }
  ],
  commentSection: fs.readFileSync('test/server/templates/comment.html', 'utf8'),
  addComment: fs.readFileSync('test/server/templates/addcomment.html', 'utf8')
};

var rendered = whiskers.render(template, context);

// uncomment to update expected
//fs.writeFileSync('test/server/rendered/blog.html', rendered);

var expected = fs.readFileSync('test/server/rendered/blog.html', 'utf8');
assert.equal(rendered, expected, 'rendered and expected differ');
