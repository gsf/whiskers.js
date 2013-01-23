// whiskers.js templating library

(function(whiskers) {
  // for compiled templates
  whiskers.cache = {};

  // main function
  whiskers.render = function(template, context) {
    // compile if not cached
    if (!whiskers.cache[template]) {
      whiskers.cache[template] = whiskers.compile(template);
    }
    return whiskers.cache[template](context);
  };

  // compile template to function
  whiskers.compile = function(template) {
    var stack = [], block, i, fn;

    // allow functions as partials
    if (template instanceof Function) return template;

    // convert to string, empty if false
    template = (template || '') + '';

    // escape backslashes, single quotes, and newlines
    template = template.replace(/\\/g, '\\\\').replace(/\'/g, '\\\'').replace(/\n/g, '\\n').replace(/\r/g, '');

    // replace comments (like {!foo!})
    template = template.replace(/(\\*){![\s\S]*?!}/g, function(str, escapeChar) {
      if (escapeChar) return str.replace('\\\\', '');
      return '';
    });

    // replace tags
    template = template.replace(/(\\*){(?:([\w_.]+)|>([\w_.]+)|for +([\w_]+) +in +([\w_.]+)|if +(not +|)([\w_.]+)|\/(for|if))}/g, function(str, escapeChar, key, partial, iterVar, forKey, ifNot, ifKey, closeStatement, offset, s) {
      if (escapeChar) return str.replace('\\\\', '');
      // {foo}
      if (key) {
        // {else}
        if (key == 'else') {
          block = stack[stack.length-1];
          if (block && !block.elsed) {
            block.elsed = true;
            if (block.statement == 'if') return '\'}else{b+=\'';
            if (block.statement == 'for') return '\'}if(!g(c,\''+block.key+'\')){b+=\'';
          }
          console.warn('extra {else} ignored');
          return '';
        }
        // {anything.but.else}
        return '\'+g(c,\''+key+'\')+\'';
      }
      // {>foo}
      if (partial) return '\'+r(g(c,\''+partial+'\'),c)+\'';
      // {for foo in bar}
      if (forKey) {
        stack.push({statement:'for', key:forKey});
        return '\';var '+iterVar+'A=g(c,\''+forKey+'\');for(var '+iterVar+'I=0;'+iterVar+'I<'+iterVar+'A.length;'+iterVar+'I++){c[\''+iterVar+'\']='+iterVar+'A['+iterVar+'I];b+=\'';
      }
      // {if foo} or {if not foo}
      if (ifKey) {
        stack.push({statement:'if'});
        return '\';if('+(ifNot?'!':'')+'g(c,\''+ifKey+'\')){b+=\'';
      }
      // {/for} or {/if}
      if (closeStatement) {
        block = stack[stack.length-1];
        if (block && block.statement == closeStatement) {
          stack.pop();
          return '\'}b+=\'';
        }
        console.warn('extra {/'+closeStatement+'} ignored');
        return '';
      }
      // not a valid tag, don't replace
      return str;
    });

    // close extra fors and ifs
    for (i=stack.length-1; i>-1; i--) {
      block = stack[i];
      console.warn('extra {'+block.statement+'} closed at end of template');
      template = template+'\'}b+=\'';
    }

    // c is context, b is buffer
    fn = new Function('g', 'r', 'return function(c){var b=\''+template+'\';return b}');
    return fn(get, whiskers.render);
  };

  // get value with dot notation, e.g. get(obj, 'key.for.something')
  function get(obj, key) {
    var i, accessor = key.split('.'), empty = true;
    for (i=0; i<accessor.length; i++) {
      // empty string for key.that.does.not.exist
      if (!obj) return '';
      obj = obj[accessor[i]];
    }
    // empty string for every falsy value except 0
    if (obj === undefined || obj === null || obj === false) return '';
    // treat [] and {} as falsy also
    if (obj instanceof Array && obj.length == 0) return '';
    if (obj.constructor === Object) {
      for (i in obj) if (obj.hasOwnProperty(i)) empty = !i;
      if (empty) return '';
    }
    return obj;
  }

  // for Express
  whiskers.__express = function() {try {return require('./__express')} catch (e) {}}();
}(typeof module == 'object' ? module.exports : window.whiskers = {}));
