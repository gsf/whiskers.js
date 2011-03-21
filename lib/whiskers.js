// whiskers.js templating library

var whiskers = (function() {
  var cache = {};

  // a forgiving object[key]
  var getValue = function(obj, key) {
    var gv = function(obj, keys) {
      if (keys.length === 0) {
        // if value is a function, call it
        if (typeof obj === 'function') {
          return obj();
        };
        return obj;
      }
      first = keys.shift();
      // return empty string on missing key
      if (!obj.hasOwnProperty(first)) return '';
      return gv(obj[first], keys);
    };
    var keys = key.split('.');
    return gv(obj, keys);
  }; 

  var getArray = function(obj, key) {
    // XXX check whether retrieved value is array?
    return getValue(obj, key) || [];
  };

  // expand all partials
  var expand = function(template, partials) {
    template = template.replace(/(\\*){>([\w.]+)}/g, function(str, escapeChar, partialKey) {
      // if tag is escaped return it untouched with first backslash removed
      if (escapeChar) return str.replace('\\', '');
      // drop trailing whitespace in partial
      return getValue(partials, partialKey).replace(/\s+$/, '');
    });
    return template;
  };

  // compile template to js string for eval
  var compile = function(template) {
    var levels = {'for':0, 'if': 0};
    var nearby = function(offset, s) {
      return s.slice(offset-30, offset+10);
    };
    // escape single quotes
    template = template.replace(/\'/g, '\\\'');
    // replace simple key tags (like {foo})
    template = template.replace(/(\\*){([\w.]+)}/g, function(str, escapeChar, key) {
      if (escapeChar) return str.replace('\\', '');
      return '\'+getValue(context,\''+key+'\')+\'';
    });
    // replace logic tags (like {for foo in bar} and {if foo})
    template = template.replace(/((?:\n|\r|\r\n)[ \t]*|)(\\*){(\/?)(for|if|)( +|)(not +|)((\w+) +in +|)([\w.]+|)}(?:([ \t]*(?=\n|\r|\r\n))|)/g, function(str, newlineBefore, escapeChar, close, statement, statementSpace, ifNot, forIn, iterVar, key, newlineAfter, offset, s) {
      if (escapeChar) return str.replace('\\', '');
      // if a logic tag is on a line by itself remove preceding newline and 
      // whitespace
      if (newlineBefore && newlineAfter !== undefined) {
        newlineBefore = '';
      }
      // opening tags
      if (statement && statementSpace && key) {
        levels[statement]++;
        // {for foo in bar}
        if (statement === 'for' && iterVar) {
          return newlineBefore+'\';var '+iterVar+'A=getArray(context,\''+key+'\');for(var '+iterVar+'I=0;'+iterVar+'I<'+iterVar+'A.length;'+iterVar+'I++){context[\''+iterVar+'\']='+iterVar+'A['+iterVar+'I];buffer+=\'';
        }
        // {if foo} or {if not foo}
        if (statement === 'if') {
          return newlineBefore+'\';if('+(ifNot?'!':'')+'getValue(context,\''+key+'\')){buffer+=\'';
        }
      }
      // closing tags ({/for} or {/if})
      if (close && statement) {
        if (levels[statement] === 0) {
          console.warn('extra {/'+statement+'} ignored at "'+nearby(offset, s)+'"');
          return '';
        } else {
          levels[statement]--;
          return newlineBefore+'\';}buffer+=\'';
        }
      }
      // not a tag, don't replace
      return str;
    });
    // close extra fors and ifs
    for (statement in levels) {
      for (var i=0; i<levels[statement]; i++) {
        console.warn('extra "'+statement+'" closed at end of template');
        template = template+'\';}buffer+=\'';
      }
    }
    // escape newlines for eval
    template = template.replace(/\n/g, '\\n');
    // wrap in function
    // XXX include sourceURL? see 
    // XXX http://code.google.com/p/v8/issues/detail?id=672
    template = '(function(){return function(context){var buffer=\''+template+'\';return buffer}})()';
    return template;
  };

  // main function 
  var render = function(template, context, partials) {
    template = expand(template, partials);
    // use cached if it exists
    if (cache[template]) return cache[template](context);
    // compile and cache
    cache[template] = eval(compile(template));
    return cache[template](context);
  };

  return {
    expand: expand,
    compile: compile,
    render: render
  };
})();

// populate exports for commonJS
if (typeof exports !== "undefined") {
  for (attribute in whiskers) {
    if (whiskers.hasOwnProperty(attribute)) {
      exports[attribute] = whiskers[attribute];
    }
  }
}
