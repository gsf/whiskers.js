// selleck.js —- javascript templating

var selleck = (function() {
  var cache = {};
  // A forgiving object[key]
  var getValue = function(obj, key) {
    var gv = function(obj, keys) {
      if (keys.length === 0) {
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
    // XXX check on whether retrieved value is array?
    return getValue(obj, key) || [];
  };
  // expand all partials
  var expand = function(template, partials) {
    template = template.replace(/(\\*){>([\w.]+)}/g, function(str, escapeChar, partialKey) {
      if (escapeChar) {
        return str.replace('\\', ''); // only replace the first backslash
      }
      // drop trailing whitespace in partial
      return getValue(partials, partialKey).replace(/\s+$/, '');
    });
    return template;
  };
  var compile = function(template) {
    var replacement;
    var levels = {'for':0, 'if': 0};
    var nearby = function(offset, s) {
      return s.slice(offset-30, offset+10);
    };
    // escape single quotes
    template = template.replace(/\'/g, '\\\'');
    // replace simple key tags (like {foo})
    template = template.replace(/(\\*){([\w.]+)}/g, function(str, escapeChar, key) {
      if (escapeChar) {
        return str.replace('\\', ''); // only replace the first backslash
      }
      return '\'+getValue(context,\''+key+'\')+\'';
    });
    // replace logic tags (like {for foo in bar} and {if foo})
    template = template.replace(/((?:\n|\r|\r\n)[ \t]*|)(\\*){(\/?)(for|if|)( +|)(not +|)((\w+) +in +|)([\w.]+|)}(?:([ \t]*(?=\n|\r|\r\n))|)/g, function(str, newlineBefore, escapeChar, close, statement, statementSpace, ifNot, forIn, iterVar, key, newlineAfter, offset, s) {
      if (escapeChar) {
        return str.replace('\\', ''); // only replace the first backslash
      }
      // if a logic tag is on a line by itself remove preceding newline and 
      // whitespace
      if (newlineBefore && newlineAfter !== undefined) {
        newlineBefore = '';
      }
      // {for foo in bar}
      if (statement === 'for' && statementSpace && iterVar && key) {
        levels['for']++;
        replacement = newlineBefore+'\';var '+iterVar+'A=getArray(context,\''+key+'\');for(var '+iterVar+'I=0;'+iterVar+'I<'+iterVar+'A.length;'+iterVar+'I++){context[\''+iterVar+'\']='+iterVar+'A['+iterVar+'I];buffer+=\'';
      // {if foo} or {if not foo}
      } else if (statement === 'if' && statementSpace && key) {
        levels['if']++;
        replacement = newlineBefore+'\';if('+(ifNot?'!':'')+'getValue(context,\''+key+'\')){buffer+=\'';
      // {/for} or {/if}
      } else if (close && statement) {
        if (levels[statement] === 0) {
          console.warn('extra {/'+statement+'} ignored at "'+nearby(offset, s)+'"');
          replacement = '';
        } else {
          levels[statement]--;
          replacement = newlineBefore+'\';}buffer+=\'';
        }
      // not a tag, don't replace
      } else {
        replacement = str;
      }
      return replacement;
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
    // http://code.google.com/p/v8/issues/detail?id=672
    template = '(function(){return function(context){var buffer=\''+template+'\';return buffer}})()';
    return template;
  };
  var render = function(template, context, partials) {
    template = expand(template, partials);
    // use cached if it exists
    if (cache[template]) return cache[template](context);
    // compile and cache
    cache[template] = eval(compile(template));
    return cache[template](context);
  };
  return {
    compile: compile,
    render: render
  };
})();

// populate exports for commonJS
for (attribute in selleck) {
  if (selleck.hasOwnProperty(attribute)) {
    exports[attribute] = selleck[attribute];
  }
}
