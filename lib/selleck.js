// selleck.js —- javascript templating

var selleck = (function() {
  var cache = {};
  // A forgiving object.get(key)
  var getValue = function(obj, key) {
    var gv = function(obj, keys) {
      if (keys.length === 0) {
        return obj;
      }
      first = keys.shift();
      // empty return on missing key
      if (!obj.hasOwnProperty(first)) return '';
      return gv(obj[first], keys);
    };
    var keys = key.split('.');
    return gv(obj, keys);
  }; 
  var getArray = function(obj, key) {
    // XXX more checks on whether gotten value is array?
    return getValue(obj, key) || [];
  };
  var expand = function(template, partials) {
    // expand all partials
    template = template.replace(/(\n[ \t]*|){>([\w.]+)}(\s*\n|)/g, function(str, newlineBefore, partialKey, newlineAfter) {
      if (newlineBefore && newlineAfter) {
        newlineBefore = '\n';
        newlineAfter = '';
      }
      return newlineBefore+getValue(partials, partialKey)+newlineAfter;
    });
    return template;
  };
  var compile = function(template, partials) {
    var expanded = template = expand(template, partials);
    console.log(expanded);
    // first check cache and return if cached
    if (cache[expanded]) {
      return cache[expanded];
    } 
    // compile if not cached
    var replacement;
    var forLevel = ifLevel = 0;
    var nearby = function(offset, s) {
      return s.slice(offset-30, offset+10);
    };
    // replace simple key tags like {foo}
    template = template.replace(/{([\w.]+)}/g, function(str, key) {
      return '\'+getValue(context,\''+key+'\')+\'';
    });
    // replace logic tags like {for foo in bar} and {if foo}
    template = template.replace(/(\n[ \t]*|){(\/?)(for|if|)( +|)(not +|)((\w+) +in +|)([\w.]+|)}(\s*\n|)/g, function(str, newlineBefore, close, statement, statementSpace, ifNot, forIn, iterVar, key, newlineAfter, offset, s) {
      if (newlineBefore && newlineAfter) {
        newlineBefore = '\n';
        newlineAfter = '';
      }
      if (statement === 'for' && iterVar && key) { // {for foo in bar}
        forLevel++;
        replacement = newlineBefore+'\';var '+iterVar+'A=getArray(context,\''+key+'\');for(var '+iterVar+'I=0;'+iterVar+'I<'+iterVar+'A.length;'+iterVar+'I++){context[\''+iterVar+'\']='+iterVar+'A['+iterVar+'I];buffer+=\''+newlineAfter;
      } else if (statement === 'if' && statementSpace && key) { // {if foo} or {if not foo}
        ifLevel++;
        replacement = newlineBefore+'\';if('+(ifNot?'!':'')+'getValue(context,\''+key+'\')){buffer+=\''+newlineAfter;
      } else if (close && statement === 'for') { // {/for}
        if (forLevel === 0) {
          console.warn('extra {/for} ignored at "'+nearby(offset, s)+'"');
          replacement = '';
        } else {
          forLevel--;
          replacement = newlineBefore+'\';}buffer+=\''+newlineAfter;
        }
      } else if (close && statement === 'if') { // {/if}
        if (ifLevel === 0) {
          console.warn('extra {/if} ignored at "'+nearby(offset, s)+'"');
          replacement = '';
        } else {
          ifLevel--;
          replacement = newlineBefore+'\';}buffer+=\''+newlineAfter;
        }
      } else { // match on {} -- return str
        replacement = str;
      }
      return replacement;
    });
    for (var i=0; i<forLevel; i++) {
      console.warn('extra "for" closed at end of template');
      template = template+'\';}buffer+=\'';
    }
    for (var i=0; i<ifLevel; i++) {
      console.warn('extra "if" closed at end of template');
      template = template+'\';}buffer+=\'';
    }
    // wrap in function
    template = '(function(){return function(context){var buffer=\''+template+'\';return buffer}})()';
    // ready newlines for eval
    template = template.replace(/\n/g, '\\n');
    console.log(template);
    // cache template
    cache[expanded] = eval(template);
    return cache[expanded];
  };
  var render = function(template, context, partials) {
    var compiled = compile(template, partials);
    return compiled(context);
  };
  return {
    compile: compile,
    render: render
  };
})();

// for commonJS
for (attribute in selleck) {
  if (selleck.hasOwnProperty(attribute)) {
    exports[attribute] = selleck[attribute];
  }
}
