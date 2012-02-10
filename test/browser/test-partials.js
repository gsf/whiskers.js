// test partials

test('partials', 11, function() {
  equal(whiskers.render('{>p}'), '');
  equal(whiskers.render('{>p}', {}, {}), '');
  equal(whiskers.render('{>p.a}'), '');
  equal(whiskers.render('{>p.a}', {}, {}), '');
  equal(whiskers.render('{>p}', {}, {p:3}), '3');
  equal(whiskers.render('{>p}', {}, {p:[]}), '');
  equal(whiskers.render('{>p}', {}, {p:function(){return 'foo'}}), 'foo');

  equal(whiskers.render('{>p.a}', {}, {p:{a:'foo'}}), 'foo');
  equal(whiskers.render('{>p.a.b}', {}, {p:{a:{b:'foo'}}}), 'foo');

  var template = 'book: {title}{for author in authors}{>comma} {>author}{/for}';
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

  var rendered = whiskers.render(template, context, partials);
  var expected = 'book: Bob, author: Liz, pet: Errol, author: Jan';
  equal(rendered, expected);
  
  //
  // context self reference
  var template = '{me} friends:{for f in friends} {>friend}{/for}';
  var partials = {
     friend: '[{self.name}:{self.status}{for f in self.friends} {>friend}{/for}]',
  };
  var context = {
     me: 'Bob',
     friends: [
        {
           name: 'Liz',
           status: 'online',
           friends: [
              {
                 name: 'Errol',
                 status: 'offline'
              }
           ]
        }
     ]
  };
  var rendered = whiskers.render(template, context, partials);
  var expected = 'Bob friends: [Liz:online [Errol:offline]]';
  equal(rendered, expected);
  
});
