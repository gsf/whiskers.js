// whiskers.js templating library

// the encapsulating function
(function(whiskers) {
  // for compiled templates
  whiskers.cache = {};

  // main function
  whiskers.render = function(template, context, partials) {
    template = whiskers.expand(template, partials);
    // use cached if it exists
    if (whiskers.cache[template]) return whiskers.cache[template](context);
    // compile and cache
    whiskers.cache[template] = eval(whiskers.compile(template));
    return whiskers.cache[template](context);
  };

  // expand all partials
  whiskers.expand = function(template, partials, indent) {
    // convert to string, empty if false
    template = (template || '')+'';
    // drop trailing newlines and prepend indent to each line
    indent = indent || '';
    template = indent + template.replace(/\n+$/, '').replace(/\n/g, indent || '\n');
    return template.replace(/(\n[ \t]+|)(\\*){>([\w.]+)}/g, function(str, indent, escapeChar, key) {
      // if tag is escaped return it untouched with first backslash removed
      if (escapeChar) return str.replace('\\', '');
      // get partial, empty if not found
      try {
        template = eval('partials.'+key);
      } catch (e) {
        template = '';
      }
      // recurse to expand any partials in this partial
      return whiskers.expand(template, partials, indent);
    });
  };

  // compile template to js string for eval
  whiskers.compile = function(template) {
    // convert to string, empty if false
    template = (template || '')+'';

    // escape backslashes and single quotes
    template = template.replace(/\\/g, '\\\\').replace(/\'/g, '\\\'');

    // replace simple key tags (like {foo})
    template = template.replace(/(\\*){([\w.]+)}/g, function(str, escapeChar, key) {
      if (escapeChar) return str.replace('\\\\', '');
      return '\'+g(\''+key+'\')+\'';
    });

    // to check for correcting logic mistakes
    var levels = {'for':0, 'if': 0};

    // replace logic tags (like {for foo in bar} and {if foo})
    template = template.replace(/(\n[ \t]*|)(\\*){(\/?)(for|if|)( +|)(not +|)((\w+) +in +|)([\w.]+|)}(?:([ \t]*(?=\n))|)/g, function(str, newlineBefore, escapeChar, close, statement, statementSpace, ifNot, forIn, iterVar, key, newlineAfter, offset, s) {
      if (escapeChar) return str.replace('\\\\', '');
      // remove preceding newline and whitespace for standalone logic tag
      if (newlineBefore && newlineAfter !== undefined) {
        newlineBefore = '';
      }
      // opening tags
      if (statement && statementSpace && key) {
        levels[statement]++;
        // {for foo in bar}
        if (statement === 'for' && iterVar) {
          return newlineBefore+'\';var '+iterVar+'A=g(\''+key+'\');for(var '+iterVar+'I=0;'+iterVar+'I<'+iterVar+'A.length;'+iterVar+'I++){c[\''+iterVar+'\']='+iterVar+'A['+iterVar+'I];b+=\'';
        }
        // {if foo} or {if not foo}
        if (statement === 'if') {
          return newlineBefore+'\';if('+(ifNot?'!':'')+'g(\''+key+'\')){b+=\'';
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
    // c is context, b is buffer, g is get, k is key, v is value
    return '(function(){return function(c){var g=function(k){var v;try{v=eval(\'c.\'+k)||\'\'}catch(e){v=\'\'}if(typeof v==\'function\')v=v(c);return v;};var b=\''+template+'\';return b}})()';
  };
})(typeof module == 'object' ? module.exports : window.whiskers = {});
