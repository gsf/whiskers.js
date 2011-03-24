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

  var getPartial = function(partials, key, indent) {
    // drop trailing newlines
    var partial = getValue(partials, key).replace(/\n+$/, '');
    // prepend indent to each line
    if (indent) {
      partial = indent + partial.replace(/\n/g, indent);
    }
    return partial;
  };

  // expand all partials
  // XXX expanding partials at compile time means recursion is impossible
  //     but i think it's worth it to have them compiled
  //     it would be nice if we could throw an error on recursion
  var expand = function(template, partials) {
    template = template.replace(/(\n[ \t]+|)(\\*){>([\w.]+)}/g, function(str, indent, escapeChar, key) {
      // if tag is escaped return it untouched with first backslash removed
      if (escapeChar) return str.replace('\\', '');
      // recurse to expand any partials in this partial
      return expand(getPartial(partials, key, indent), partials);
    });
    return template;
  };

  // compile template to js string for eval
  var compile = function(template) {
    var levels = {'for':0, 'if': 0};
    // escape backslashes
    template = template.replace(/\\/g, '\\\\');
    // escape single quotes
    template = template.replace(/\'/g, '\\\'');
    // replace simple key tags (like {foo})
    template = template.replace(/(\\*){([\w.]+)}/g, function(str, escapeChar, key) {
      if (escapeChar) return str.replace('\\\\', '');
      return '\'+getValue(context,\''+key+'\')+\'';
    });
    // replace logic tags (like {for foo in bar} and {if foo})
    template = template.replace(/(\n[ \t]*|)(\\*){(\/?)(for|if|)( +|)(not +|)((\w+) +in +|)([\w.]+|)}(?:([ \t]*(?=\n))|)/g, function(str, newlineBefore, escapeChar, close, statement, statementSpace, ifNot, forIn, iterVar, key, newlineAfter, offset, s) {
      if (escapeChar) return str.replace('\\\\', '');
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
          console.warn('extra {/'+statement+'} ignored');
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

// commonjs
if (typeof module === 'object') {
  module.exports = whiskers;
}
