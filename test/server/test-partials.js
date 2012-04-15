// test partials

var common = require('./common');
var assert = common.assert;
var whiskers = common.whiskers;

common.expected = 11;

assert.equal(whiskers.compile('{>p}')(), '');
assert.equal(whiskers.render('{>p}'), '');
assert.equal(whiskers.render('{>p}', {test:'bob'}), '');
assert.equal(whiskers.render('{>p.a}'), '');
assert.equal(whiskers.render('{>p.a}', {}), '');
assert.equal(whiskers.render('{>p}', {p:3}), '3');
assert.equal(whiskers.render('{>p}', {p:[]}), '');
assert.equal(whiskers.render('{>p}', {p:function(){return 'foo'}}), 'foo');

assert.equal(whiskers.render('{>p.a}', {p:{a:'foo'}}), 'foo');
assert.equal(whiskers.render('{>p.a.b}', {p:{a:{b:'foo'}}}), 'foo');

var template = 'book: {title}{for author in authors}{>partials.comma} {>partials.author}{/for}';
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
  ],
  partials: {
    author: 'author: {author.name}{for pet in author.pets}{>partials.comma} {>partials.pet}{/for}',
    pet: 'pet: {pet.name}',
    comma: ','
  }
};

var rendered = whiskers.render(template, context);
var expected = 'book: Bob, author: Liz, pet: Errol, author: Jan';
assert.equal(rendered, expected, 'unexpected result for partial in partial');
