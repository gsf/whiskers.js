// whiskers.js templating library

(function(whiskers) {
  // for compiled templates
  whiskers.cache = {};

  // main function
  whiskers.render = function(template, context, partials) {
    context = context || {};
    partials = partials || {};
    // compile if not cached
    if (!whiskers.cache[template]) {
      whiskers.cache[template] = whiskers.compile(template);
    }
    return whiskers.cache[template](context, partials);
  };

  // compile template to function
  whiskers.compile = function(template) {
    // convert to string, empty if false
    template = (template || '') + '';

    // escape backslashes, single quotes, and newlines
    template = template.replace(/\\/g, '\\\\').replace(/\'/g, '\\\'').replace(/\n/g, '\\n').replace(/\r/g, '');

    // replace comment tags (like {!foo!})
    template = template.replace(/(\\*){![\s\S]*?!}/, function(str, escapeChar) {
      if (escapeChar) return str.replace('\\\\', '');
      return '';
    });

    // for ignoring extra logic tags
    var ignore = function(sectionChar, key) {
      console.warn('extra {'+sectionChar+key+'} ignored');
      return '';
    };

    // to keep track of the logic
    var stack = [], section;

    // replace tags
    template = template.replace(/(\\*){([>?#^\/]?)([\w_.]+)}/g, function(str, escapeChar, sectionChar, key) {
      // return string as is if escaped
      if (escapeChar) return str.replace('\\\\', '');
      // simple variable
      if (!sectionChar) return '\'+t._g(c,\''+key+'\')+\'';
      // partial
      if (sectionChar == '>') {
        return '\'+t.render(t._g(p,\''+key+'\'),c,p)+\'';
      // if section
      } else if (sectionChar == '?') {
        if (section && section.key == key) {
          if (section.character == '^') {
            section.character = '?';
            return '\'}else{b+=\'';
          }
          return ignore(sectionChar, key);
        }
        stack.push({key: key, character: '?'});
        return '\';if(t._g(c,\''+key+'\')){b+=\'';
      // for section
      } else if (sectionChar == '#') {
        stack.push({key: key, character: '#'});
        return '\';var '+key+'A=t._g(c,\''+key+'\');for(var '+key+'I=0;'+key+'I<'+key+'A.length;'+key+'I++){c.push('+key+'A['+key+'I]);b+=\'';
      // if-not section
      } else if (sectionChar == '^') {
        section = stack[stack.length-1];
        if (section && section.key == key) {
          if (section.character == '?') {
            section.character = '^';
            return '\'}else{b+=\'';
          } else if (section.character == '#') {
            section.character = '^';
            return '\'}if(!t._g(c,\''+key+'\')){b+=\'';
          }
          return ignore(sectionChar, key);
        }
        stack.push({key: key, character: '^'});
        return '\';if(!t._g(c,\''+key+'\')){b+=\'';
      // section close
      } else if (sectionChar == '/') {
        section = stack[stack.length-1];
        if (section && section.key == key) {
          stack.pop();
          return '\'}b+=\'';
        }
        return ignore(sectionChar, key);
      }
    });

    // close extra sections
    for (var i=stack.length-1; i>-1; i--) {
      section = stack[i];
      console.warn('extra {'+section.character+section.key+'} closed at end of template');
      template = template+'\'}b+=\'';
    }

    // c is context, p is partials, b is buffer
    var fn = new Function('var t=this;return function(c,p){c=[c];p=[p];var b=\''+template+'\';return b}');
    return fn.apply(whiskers);
  };

  // get value with dot notation, e.g. _g(stack, 'key.for.something')
  whiskers._g = function(stack, key) {
    var accessor = key.split('.');
    for (var i=stack.length-1; i>-1; i--) {
      for (var i=0, l=accessor.length; i<l; i++) {
        obj = obj[accessor[i]];
        if (!obj) break;
      }
      if (obj) break;
    }
    if (obj === undefined) obj = '';
    return obj;
  };

  // extend object with another object's properties
  whiskers._e = function(a, b){
    for (var key in b) {
      if (b[key] !== undefined) a[key] = b[key];
    }
    return a;
  };
})(typeof module == 'object' ? module.exports : window.whiskers = {});
