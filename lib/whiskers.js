// whiskers.js templating library

var whiskers = {};

// a cache for templates
whiskers.cache = {};

// a forgiving object[key]
whiskers.getValue = function(obj, key) {
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

whiskers.getArray = function(obj, key) {
  // XXX check whether retrieved value is array?
  return whiskers.getValue(obj, key) || [];
};

// expand all partials
// XXX expanding partials at compile time means recursion is impossible
whiskers.expand = function(template, partials) {
  var getPartial = function(partials, key, indent) {
    var gp = function(partials, keys) {
      if (keys.length === 0) {
        return partials;
      }
      first = keys.shift();
      // return empty string on missing key
      if (!partials.hasOwnProperty(first)) return '';
      return gp(partials[first], keys);
    };
    var keys = key.split('.');
    // drop trailing newlines
    var partial = gp(partials, keys).replace(/\n+$/, '');
    // prepend indent to each line
    return indent + partial.replace(/\n/g, indent || '\n');
  }; 
  var e = function(template, partials) {
    return template.replace(/(\n[ \t]+|)(\\*){>([\w.]+)}/g, function(str, indent, escapeChar, key) {
      // if tag is escaped return it untouched with first backslash removed
      if (escapeChar) return str.replace('\\', '');
      // recurse to expand any partials in this partial
      return e(getPartial(partials, key, indent), partials);
    });
  };
  return e(template, partials);
};

// compile template to js string for eval
// TODO no external references in eval string
whiskers.compile = function(template) {
  var levels = {'for':0, 'if': 0};

  // escape backslashes and single quotes
  template = template.replace(/\\/g, '\\\\').replace(/\'/g, '\\\'');

  // replace simple key tags (like {foo})
  template = template.replace(/(\\*){([\w.]+)}/g, function(str, escapeChar, key) {
    if (escapeChar) return str.replace('\\\\', '');
    return '\'+whiskers.getValue(context,\''+key+'\')+\'';
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
        return newlineBefore+'\';var '+iterVar+'A=whiskers.getArray(context,\''+key+'\');for(var '+iterVar+'I=0;'+iterVar+'I<'+iterVar+'A.length;'+iterVar+'I++){context[\''+iterVar+'\']='+iterVar+'A['+iterVar+'I];buffer+=\'';
      }
      // {if foo} or {if not foo}
      if (statement === 'if') {
        return newlineBefore+'\';if('+(ifNot?'!':'')+'whiskers.getValue(context,\''+key+'\')){buffer+=\'';
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

  // wrap in function and return
  return '(function(){return function(context){var buffer=\''+template+'\';return buffer}})()';
};

// main function for rendering templates
whiskers.render = function(template, context, partials) {
  template = whiskers.expand(template, partials);
  // use cached if it exists
  if (whiskers.cache[template]) return whiskers.cache[template](context);
  // compile and cache
  whiskers.cache[template] = eval(whiskers.compile(template));
  return whiskers.cache[template](context);
};

// commonjs
if (typeof module === 'object') {
  module.exports = whiskers;
}
