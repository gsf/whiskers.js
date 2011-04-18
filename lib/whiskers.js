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
    whiskers.cache[template] = whiskers.compile(template);
    return whiskers.cache[template](context);
  };


  // expand all partials
  whiskers.expand = function(template, partials, indent) {
    // convert to string, empty if false
    template = (template || '') + '';
    // drop trailing newlines and prepend indent to each line
    indent = indent || '';
    // helper function for getting partials with dot notation
    var getPartial = function(partials, key) {
      var parts = key.split('.');
      for (var i=0, len=parts.length; i<len; i++) {
        partials = partials[parts[i]];
        if (!partials) break;
      }
      return partials || '';
    };
    template = indent + template.replace(/\n+$/, '').replace(/\n/g, indent || '\n');
    return template.replace(/(\n[ \t]+|)(\\*){>([\w.]+)}/g, function(str, indent, escapeChar, key) {
      // if tag is escaped return it untouched with first backslash removed
      if (escapeChar) return str.replace('\\', '');
      // get partial
      template = getPartial(partials, key);
      // recurse to expand any partials in this partial
      return whiskers.expand(template, partials, indent);
    });
  };

  // compile template to function
  whiskers.compile = function(template) {
    // convert to string, empty if false
    template = (template || '') + '';

    // escape backslashes, single quotes, and newlines
    template = template.replace(/\\/g, '\\\\').replace(/\'/g, '\\\'').replace(/\n/g, '\\n');

    // replace comment tags (like {!foo!})
    template = template.replace(/(\\n[ \t]*|)(\\*){![\s\S]*?!}(?:([ \t]*(?=\\n))|)/, function(str, newlineBefore, escapeChar, newlineAfter) {
      if (escapeChar) return str.replace('\\\\', '');
      // remove preceding newline and whitespace if newline also after
      if (newlineBefore && newlineAfter !== undefined) {
        newlineBefore = '';
      }
      return newlineBefore+'';
    });

    // replace simple key tags (like {bar})
    template = template.replace(/(\\*){([\w.]+)}/g, function(str, escapeChar, key) {
      if (escapeChar) return str.replace('\\\\', '');
      return '\'+g(c,\''+key+'\')+\'';
    });

    // to check for correcting logic mistakes
    var levels = {'for':0, 'if': 0};

    // replace logic tags (like {for foo in bar} and {if foo})
    template = template.replace(/(\\n[ \t]*|)(\\*){(\/?)(for|if|)( +|)(not +|)((\w+) +in +|)([\w.]+|)}(?:([ \t]*(?=\\n))|)/g, function(str, newlineBefore, escapeChar, close, statement, statementSpace, ifNot, forIn, iterVar, key, newlineAfter, offset, s) {
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
          return newlineBefore+'\';var '+iterVar+'A=g(c,\''+key+'\');for(var '+iterVar+'I=0;'+iterVar+'I<'+iterVar+'A.length;'+iterVar+'I++){c[\''+iterVar+'\']='+iterVar+'A['+iterVar+'I];b+=\'';
        }
        // {if foo} or {if not foo}
        if (statement === 'if') {
          return newlineBefore+'\';if('+(ifNot?'!':'')+'g(c,\''+key+'\')){b+=\'';
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

    // c is context, g is get, o is object, k is key, p is parts, b is buffer
    return new Function('c', 'var g=function(o,k){if(k.indexOf(\'.\')==-1){if(typeof o[k]==\'function\')o[k]=o[k]();return o[k]||\'\'}var p=k.split(\'.\');o=o[p.shift()];if(!o)return \'\';k=p.join(\'.\');return g(o,k)};var b=\''+template+'\';return b');
  };
})(typeof module == 'object' ? module.exports : this.whiskers = {});
