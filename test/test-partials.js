// test template recursion

var common = require('./common');
var assert = common.assert;
var render = common.whiskers.render;

common.expected = 1;

var context = {
  title: 'Bob',
  authors: [
    {
      name: 'Liz',
      pets: [
        {name: 'Errol'}
      ]
    },
    {name: 'Jan'}  
  ]
};

var partials = {
  author: 'author: {author.name}{for pet in author.pets}{>comma} {>pet}{/for}',
  pet: 'pet: {pet.name}',
  comma: ','
};

console.log(render('book: {title}{for author in authors}{>comma} {>author}{/for}', context, partials));
//assert.equal(render('{level}{for child in children}{>level2}{/for}', context, partials), '123');
