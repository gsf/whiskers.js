// test partials

test('partials', 11, function() {
  equal(whiskers.compile('{>p}')(), '');
  equal(whiskers.render('{>p}'), '');
  equal(whiskers.render('{>p}', {}), '');
  equal(whiskers.render('{>p.a}'), '');
  equal(whiskers.render('{>p.a}', {}), '');
  equal(whiskers.render('{>p}', {p:3}), '3');
  equal(whiskers.render('{>p}', {p:[]}), '');
  equal(whiskers.render('{>p}', {p:function(){return 'foo'}}), 'foo');

  equal(whiskers.render('{>p.a}', {p:{a:'foo'}}), 'foo');
  equal(whiskers.render('{>p.a.b}', {p:{a:{b:'foo'}}}), 'foo');

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
  equal(rendered, expected);
});
