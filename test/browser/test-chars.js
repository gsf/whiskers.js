// test for troubling characters

test('chars', 11, function() {
  equal(whiskers.render('\\'), '\\');
  equal(whiskers.render('\''), '\'');
  equal(whiskers.render('\\\''), '\\\'');
  equal(whiskers.render('\\\'{vehicle}', {vehicle: 'truck'}), '\\\'truck');
  equal(whiskers.render('bob\nsue'), 'bob\nsue');
  equal(whiskers.render('bob\r\nsue'), 'bob\nsue');
  equal(whiskers.render('{under_score}', {under_score: 'truck'}), 'truck');
  equal(whiskers.render('{hyphenated-key}', {'hyphenated-key': 'truck'}),
      'truck');
  equal(whiskers.render('{@context}',
      {'@context': 'special tags in json-ld use at signs'}),
      'special tags in json-ld use at signs');
  equal(whiskers.render('{dc:title}',
      {'dc:title': 'special key in json-ld use compact IRI'}),
      'special key in json-ld use compact IRI');
  equal(whiskers.render('{dc:title.dc:topic}',
      {'dc:title': {'dc:topic': 'special key in json-ld use compact IRI'}}),
      'special key in json-ld use compact IRI');
});
