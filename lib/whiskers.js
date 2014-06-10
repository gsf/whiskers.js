// whiskers.js templating library

;(function(whiskers) {
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
    var stack = [], block, i, fn, safeIterVar;

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
    template = template.replace(/(\\*){(?:(?:([\w_.\-]+)(?:\|([^\};]*))?)|>([\w_.\-]+)|for +([\w_\-]+) +in +([\w_.\-]+)|if +(not +|)([\w_.\-]+)|\/(for|if))}/g, function(str, escapeChar, key, defValue, partial, iterVar, forKey, ifNot, ifKey, closeStatement, offset, s) {
      if (escapeChar) return str.replace('\\\\', '');
      // {foo}
      if (key) {
        // {else}
        if (key == 'else') {
          block = stack[stack.length-1];
          if (block && !block.elsed) {
            block.elsed = true;
            if (block.statement == 'if') return '\'}else{b+=\'';
            if (block.statement == 'for') return '\'}if(!g(c,\''+block.forKey+'\')){b+=\'';
          }
          console.warn('extra {else} ignored');
          return '';
        }
        // {anything.but.else|or default value}
        defValue || (defValue = '');
        return '\'+g(c,\''+key+'\',\''+defValue+'\')+\'';
      }
      // {>foo}
      if (partial) return '\'+r(g(c,\''+partial+'\'),c)+\'';
      // {for foo in bar}
      if (forKey) {
        safeIterVar = iterVar.replace('-', '__');
        stack.push({statement:'for', forKey:forKey, iterVar:iterVar, safeIterVar:safeIterVar});
        return '\';var __'+safeIterVar+'=g(c,\''+iterVar+'\');var '+safeIterVar+'A=g(c,\''+forKey+'\');for(var '+safeIterVar+'I=0;'+safeIterVar+'I<'+safeIterVar+'A.length;'+safeIterVar+'I++){c[\''+iterVar+'\']='+safeIterVar+'A['+safeIterVar+'I];b+=\'';
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
          return '\'}'+(block.statement == 'for' ? 'c[\''+block.iterVar+'\']=__'+block.safeIterVar+';' : '')+'b+=\'';
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

  // get value with dot notation, with optional default value if lookup fails
  // e.g. get(obj, 'key.for.something')
  function get(obj, key, def) {
    (def == null) && (def = '');
    var i, accessor = key.split('.'), empty = true;
    for (i=0; i<accessor.length; i++) {
      // empty string for key.that.does.not.exist
      if (!obj) return def;
      obj = obj[accessor[i]];
    }
    // empty string for every falsy value except 0
    if (obj === undefined || obj === null || obj === false) return def;
    // treat [] and {} as falsy also
    if (obj instanceof Array && obj.length == 0) return def;
    if (obj.constructor === Object) {
      for (i in obj) if (obj.hasOwnProperty(i)) empty = !i;
      if (empty) return def;
    }
    return obj;
  }

  // for Express
  whiskers.__express = function() {try {return require('./__express')} catch (e) {}}();
}(typeof module == 'object' ? module.exports : window.whiskers = {}));
