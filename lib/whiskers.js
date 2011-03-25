// whiskers.js templating library

// the namespace
var whiskers = {};

// a cache for templates
whiskers.cache = {};

// expand all partials
// XXX expanding partials at compile time makes recursion impossible
whiskers.expand = function(template, partials) {
  //var getPartial = function(partials, key, indent) {
  //  var getPartialRecurse = function(partials, keys) {
  //    if (keys.length === 0) {
  //      // if it's a function, call it
  //      if (typeof partials === 'function') {
  //        return partials();
  //      };
  //      return partials;
  //    }
  //    var first = keys.shift();
  //    // return empty string on missing key
  //    if (!partials.hasOwnProperty(first)) return '';
  //    return getPartialRecurse(partials[first], keys);
  //  };
  //  var keys = key.split('.');
  //  return getPartialRecurse(partials, keys);
  //}; 
  var expandRecurse = function(template, partials, indent) {
    // convert to string, empty if false
    template = (template || '')+'';
    // drop trailing newlines and prepend indent to each line
    indent = indent || '';
    template = indent + template.replace(/\n+$/, '').replace(/\n/g, indent || '\n');
    var partial;
    return template.replace(/(\n[ \t]+|)(\\*){>([\w.]+)}/g, function(str, indent, escapeChar, key) {
      // if tag is escaped return it untouched with first backslash removed
      if (escapeChar) return str.replace('\\', '');
      //partial = getPartial(partials, key);
      // get partial, empty if not found
      try {
        partial = eval('partials.'+key);
      } catch (e) {
        partial = '';
      }
      // recurse to expand any partials in this partial
      return expandRecurse(partial, partials, indent);
    });
  };
  return expandRecurse(template, partials);
};

// compile template to js string for eval
whiskers.compile = function(template) {
  // convert to string, empty if false
  template = (template || '')+'';

  var levels = {'for':0, 'if': 0};

  // escape backslashes and single quotes
  template = template.replace(/\\/g, '\\\\').replace(/\'/g, '\\\'');

  // replace simple key tags (like {foo})
  template = template.replace(/(\\*){([\w.]+)}/g, function(str, escapeChar, key) {
    if (escapeChar) return str.replace('\\\\', '');
    return '\'+v(c,\''+key+'\')+\'';
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
        return newlineBefore+'\';var '+iterVar+'A=v(c,\''+key+'\');for(var '+iterVar+'I=0;'+iterVar+'I<'+iterVar+'A.length;'+iterVar+'I++){c[\''+iterVar+'\']='+iterVar+'A['+iterVar+'I];b+=\'';
      }
      // {if foo} or {if not foo}
      if (statement === 'if') {
        return newlineBefore+'\';if('+(ifNot?'!':'')+'v(c,\''+key+'\')){b+=\'';
      }
    }
    // closing tags ({/for} or {/if})
    if (close && statement) {
      if (levels[statement] === 0) {
        console.warn('extra {/'+statement+'} ignored');
        return '';
      } else {
        levels[statement]--;
        return newlineBefore+'\';}b+=\'';
      }
    }
    // not a tag, don't replace
    return str;
  });

  // close extra fors and ifs
  for (statement in levels) {
    for (var i=0; i<levels[statement]; i++) {
      console.warn('extra "'+statement+'" closed at end of template');
      template = template+'\';}b+=\'';
    }
  }

  // escape newlines for eval
  template = template.replace(/\n/g, '\\n');

  // wrap in function and return
  // c is context, b is buffer, v is getValue, r is recurse, o is object, 
  // k is key, s is splitKey, f is first
  return '(function(){return function(c){var v=function(o,k){var r=function(o,s){if(s.length===0){if(typeof o===\'function\')return o(c);return o}var f=s.shift();if(!o.hasOwnProperty(f))return \'\';return r(o[f],s)};var s=k.split(\'.\');return r(o,s)};var b=\''+template+'\';return b}})()';
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
