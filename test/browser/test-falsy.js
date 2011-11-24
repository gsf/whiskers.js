// test for falsy values

test('falsy', 8, function() {
  var context = {
    zero: 0,
    'false': false,
    empty: ''
  };

  equal(whiskers.render('{zero}', context), '0');
  equal(whiskers.render('{false}', context), 'false');
  equal(whiskers.render('{empty}', context), '');
  equal(whiskers.render('{undefined}', context), '');

  equal(whiskers.render('{if zero}{zero}{/if}', context), '');
  equal(whiskers.render('{if false}{false}{/if}', context), '');
  equal(whiskers.render('{if not zero}{zero}{/if}', context), '0');
  equal(whiskers.render('{if not false}{false}{/if}', context), 'false');
});
