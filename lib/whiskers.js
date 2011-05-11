// whiskers.js templating library

// the encapsulating function
(function(whiskers) {
  // for compiled templates
  whiskers.cache = {};

  // main function
  whiskers.render = function(template, context, partials) {
    template = whiskers.expand(template, partials);
    context = context || {};
    // use cached if it exists
    if (whiskers.cache[template]) return whiskers.cache[template](context);
    // compile and cache
    whiskers.cache[template] = whiskers.compile(template);
    return whiskers.cache[template](context);
  };

  // constant to guard against infinite recursion
  whiskers.MAX_TEMPLATE_DEPTH = 20;

  // expand all partials
  whiskers.expand = function(template, partials) {
    // helper function for getting partials with dot notation
    var getPartial = function(partials, key) {
      var accessors = key.split('.');
      for (var i=0, len=accessors.length; i<len; i++) {
        if (!partials) break;
        partials = partials[accessors[i]];
      }
      return partials || '';
    };
    // recursive function
    var expandr = function(template, partials, indent, depth) {
      // convert to string, empty if false
      template = (template || '') + '';
      // drop trailing newlines and prepend indent to each line
      indent = indent || '';
      template = indent + template.replace(/\n+$/, '').replace(/\n/g, indent || '\n');
      // handle template depth
      depth = depth || 0;
      if (depth > whiskers.MAX_TEMPLATE_DEPTH) {
        console.warn('maximum template depth reached');
        return template;
      }
      depth++;
      // replace partial tags
      return template.replace(/(\n[ \t]+|)(\\*){>([\w.]+)}/g, function(str, indent, escapeChar, key) {
        // if tag is escaped return it untouched with first backslash removed
        if (escapeChar) return str.replace('\\', '');
        template = getPartial(partials, key);
        // recurse to expand any partials in this partial
        return expandr(template, partials, indent, depth);
      });
    };
    return expandr(template, partials);
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

    // replace simple variable tags (like {bar})
    template = template.replace(/(\\*){([\w.]+)}/g, function(str, escapeChar, key) {
      if (escapeChar) return str.replace('\\\\', '');
      return '\'+g(c,\''+key+'\')+\'';
    });

    // to keep track of the logic
    var stack = [], block;

    // replace logic tags (like {for foo in bar} and {if foo})
    template = template.replace(/(\\n[ \t]*|)(\\*){(?:for +(\w+) +in +([\w.]+)|if +(not +|)([\w.]+)|\/(for|if))}(?:([ \t]*(?=\\n))|)/g, function(str, newlineBefore, escapeChar, iterVar, forKey, ifNot, ifKey, closeStatement, newlineAfter, offset, s) {
      if (escapeChar) return str.replace('\\\\', '');
      // remove preceding newline and whitespace for standalone logic tag
      if (newlineBefore && newlineAfter !== undefined) {
        newlineBefore = '';
      }
      // {for foo in bar}
      if (forKey) {
        stack.push({statement:'for'});
        return newlineBefore+'\';var '+iterVar+'A=g(c,\''+forKey+'\');for(var '+iterVar+'I=0;'+iterVar+'I<'+iterVar+'A.length;'+iterVar+'I++){c[\''+iterVar+'\']='+iterVar+'A['+iterVar+'I];b+=\'';
      }
      // {if foo} or {if not foo}
      if (ifKey) {
        stack.push({statement:'if'});
        return newlineBefore+'\';if('+(ifNot?'!':'')+'g(c,\''+ifKey+'\')){b+=\'';
      }
      // closing tags ({/for} or {/if})
      if (closeStatement) {
        block = stack[stack.length-1];
        if (block && block.statement == closeStatement) {
          stack.pop();
          return newlineBefore+'\';}b+=\'';
        }
        console.warn('extra {/'+closeStatement+'} ignored');
        return '';
      }
      // not a tag, don't replace
      return str;
    });

    // close extra fors and ifs
    for (var i=stack.length-1; i>-1; i--) {
      block = stack[i];
      console.warn('extra "'+block.statement+'" closed at end of template');
      template = template+'\';}b+=\'';
    }

    // c is context, g is get, o is object, k is key, a is accessors, b is buffer
    return new Function('c', 'var g=function(o,k){var a=k.split(\'.\');for(var i=0,l=a.length;i<l;i++){o=o[a[i]];if(!o)break}if(typeof o==\'function\')o=o();if(o===undefined)o=\'\';return o};var b=\''+template+'\';return b');
  };
})(typeof module == 'object' ? module.exports : this.whiskers = {});
