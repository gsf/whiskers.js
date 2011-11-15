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

    // replace comments (like {!foo!})
    template = template.replace(/(\\*){![\s\S]*?!}/, function(str, escapeChar) {
      if (escapeChar) return str.replace('\\\\', '');
      return '';
    });

    // to keep track of the logic
    var stack = [], block;

    // replace tags
    template = template.replace(/(\\*){(?:([\w_.]+)|>([\w_.]+)|for +([\w_]+) +in +([\w_.]+)|if +(not +|)([\w_.]+)|\/(for|if))}/g, function(str, escapeChar, key, partial, iterVar, forKey, ifNot, ifKey, closeStatement, offset, s) {
      if (escapeChar) return str.replace('\\\\', '');
      // {foo}
      if (key) return '\'+t._g(c,\''+key+'\')+\'';
      // {>foo}
      if (partial) return '\'+t.render(t._g(p,\''+partial+'\'),c,p)+\'';
      // {for foo in bar}
      if (forKey) {
        stack.push({statement:'for'});
        return '\';var '+iterVar+'A=t._g(c,\''+forKey+'\');for(var '+iterVar+'I=0;'+iterVar+'I<'+iterVar+'A.length;'+iterVar+'I++){c[\''+iterVar+'\']='+iterVar+'A['+iterVar+'I];b+=\'';
      }
      // {if foo} or {if not foo}
      if (ifKey) {
        stack.push({statement:'if'});
        return '\';if('+(ifNot?'!':'')+'t._g(c,\''+ifKey+'\')){b+=\'';
      }
      // {/for} or {/if}
      if (closeStatement) {
        block = stack[stack.length-1];
        if (block && block.statement == closeStatement) {
          stack.pop();
          return '\';}b+=\'';
        }
        console.warn('extra {/'+closeStatement+'} ignored');
        return '';
      }
      // not a valid tag, don't replace
      return str;
    });

    // close extra fors and ifs
    for (var i=stack.length-1; i>-1; i--) {
      block = stack[i];
      console.warn('extra "'+block.statement+'" closed at end of template');
      template = template+'\';}b+=\'';
    }

    // c is context, p is partials, b is buffer
    var fn = new Function('var t=this;return function(c,p){var b=\''+template+'\';return b}');
    return fn.apply(whiskers);
  };

  // get value with dot notation, e.g. _g(obj, 'key.for.something')
  whiskers._g = function(obj, key) {
    var accessor = key.split('.');
    for (var i=0, l=accessor.length; i<l; i++) {
      obj = obj[accessor[i]];
      if (!obj) break;
    }
    if (obj === undefined) obj = '';
    return obj;
  };
})(typeof module == 'object' ? module.exports : window.whiskers = {});
