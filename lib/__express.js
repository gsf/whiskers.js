var fs = require('fs');
var resolve = require('path').resolve;
var whiskers = require('./whiskers');

module.exports = function(path, options, fn) {
  var templates = [path];
  var partials = [''];  // empty string at index 0
  for (var p in options.partials) {
    partials.push(p);
    templates.push(resolve(options.settings.views, options.partials[p]));
  }
  var pending = templates.length;

  function compile(path, fn) {
    var compiled = whiskers.cache[path];
    // cached
    if (options.cache && compiled) return fn(null, compiled);
    // read
    fs.readFile(path, 'utf8', function(err, str){
      if (err) return fn(err);
      compiled = whiskers.compile(str);
      if (options.cache) whiskers.cache[path] = compiled;
      fn(null, compiled);
    });
  }

  templates.forEach(function(template, i){
    compile(template, function(err, compiled){
      if (err) return fn(err);
      // the view is the first template
      if (i == 0) {
        path = compiled;
      } else {
        options.partials[partials[i]] = compiled;
        if (!options[partials[i]]) options[partials[i]] = compiled;
      }
      --pending || fn(null, path(options));
    });
  });
};
