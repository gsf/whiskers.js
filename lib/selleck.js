// selleck.js —- javascript templating

var selleck = (function() {
  var keyTag = /{([\w.]+)[|]?([\w|]*)}/g;
  var forTag = /{for +(\w+) +in +([\w.]+)}/g;
  var ifTag = /{if( +not|) +([\w.]+)}/g;
  var closeTag = /{\/(for|if)}/g;
  var partialTag = /{>([\w.]+)}/g;
  //var forClose = /{\/for}/g;
  //var forNot = /{^for}/;
  //var ifClose = /{\/if}/g;
  //var ifNot = /{^if}/;
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
    template = template.replace(partialTag, function(str, partialKey) {
      return getValue(partials, partialKey);
    });
    return template;
  };
  var compile = function(template, filters) {
    template = template.replace(forTag, function(str, iterVar, arrKey) {
      return '\';var '+iterVar+'A=getArray(context,\''+arrKey+'\');for(var '+iterVar+'I=0;'+iterVar+'I<'+iterVar+'A.length;'+iterVar+'I++){context[\''+iterVar+'\']='+iterVar+'A['+iterVar+'I];buffer+=\'';
    });
    template = template.replace(ifTag, function(str, not, ifVar) {
      //console.log(not);
      return '\';if('+(not?'!':'')+'getValue(context,\''+ifVar+'\')){buffer+=\'';
    });
    template = template.replace(closeTag, function() {
      return '\';}buffer+=\'';
    });
    template = template.replace(keyTag, function(str, key, filters) {
      return '\'+getValue(context,\''+key+'\')+\'';
    });
    template = '(function(){return function(context){var buffer=\''+template+'\';return buffer}})()';
    // ready newlines for eval
    template = template.replace(/\n/g, '\\n');
    //return eval(template);
    return template;
  };
  var render = function(template, context, partials, filters) {
    template = expand(template, partials);
    // XXX hash template and partials for cache lookup key?
    var cached = cache[template];
    if (!cached) {
      var compiled = compile(template, filters);
      cache[template] = eval(compiled);
      cached = cache[template];
    } 
    //console.log(cache);
    return cached(context);
    //var lines = template.split('\n');
    //var loops = {};
    //var replaceFlag;
    //var rendered = '';
    //for (var i = 0; i < lines.length; i++) {
    //  replaceFlag = false;
    //  lines[i] = lines[i].replace(forTag, function(str, iterVar, arrVar) {
    //    replaceFlag = true;
    //    loops[arrVar] = true;
    //    return '';
    //  });
    //  lines[i] = lines[i].replace(keyTag, function(str, key, filters) {
    //    return getValue(key, context);
    //  });
    //  // Drop lines made blank by replacement
    //  if (replaceFlag && (!lines[i].match(/\S/))) {
    //    continue;
    //  }
    //  // Don't include last line if it's blank
    //  if (i === lines.length-1 && lines[i] === '') {
    //    continue;
    //  }
    //  rendered += lines[i]+'\n';
    //}
    //return rendered;
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

var extras = {
  buffer: [],
  context: {},
  keyTag: new RegExp('{([\\w.]+)[|]?([\\w|]*)}'),

  render: function(template, context, partials, in_recursion) {
    var first;
    // recurse into context for value
    var getValue = function(keys, context) {
      if (keys.length === 0) {
        return context;
      }
      first = keys.shift();
      // empty return on missing key
      if (!context.hasOwnProperty(first)) return '';
      return getValue(keys, context[first]);
    }; 
    var regex = new RegExp('{([\\w.]+)[|]?([\\w|]*)}');
    var lines = template.split("\n");
    var keys;
    for (var i = 0; i < lines.length; i++) {
      lines[i] = lines[i].replace(regex, function(str, name, filters) {
        keys = name.split('.');
        return getValue(keys, context);
      });
    }
    return lines.join('\n');
    
    //  if(!in_recursion) {
    //    this.send(lines[i]);
    //  }
    //var html = selleck.render_section(template, context, partials);
    //if(in_recursion) {
    //  return this.render_tags(html, context, partials, in_recursion);
    //}

    //this.render_tags(html, context, partials, in_recursion);
  },

  replaceKeyTag: function(str, key, filters) {
    return '\'+selleck.getValue(\''+key+'\', context)+\'';
  },

  getValue: function(key, context) {
    var gv = function(keys, context) {
      if (keys.length === 0) {
        return context;
      }
      first = keys.shift();
      // empty return on missing key
      if (!context.hasOwnProperty(first)) return '';
      return gv(keys, context[first]);
    };
    var keys = key.split('.');
    return gv(keys, context);
  }, 

  compile: function(section) {
    var lines = section.split('\n');
    for (var i = 0; i < lines.length; i++) {
      lines[i] = lines[i].replace(selleck.keyTag, selleck.replaceKeyTag);
    }
    var compiled = '\''+lines.join('\\n')+'\'';
    //return function() {
    return compiled;
    //};
  },

  // Sends parsed lines
  send: function(line) {
    if(line != "") {
      this.buffer.push(line);
    }
  },

  // Looks for %PRAGMAS
  //render_pragmas: function(template) {
  //  // no pragmas
  //  if(!this.includes("%", template)) {
  //    return template;
  //  }

  //  var that = this;
  //  var regex = new RegExp(this.otag + "%([\\w-]+) ?([\\w]+=[\\w]+)?" +
  //        this.ctag);
  //  return template.replace(regex, function(match, pragma, options) {
  //    if(!that.pragmas_implemented[pragma]) {
  //      throw({message: 
  //        "This implementation of mustache doesn't understand the '" +
  //        pragma + "' pragma"});
  //    }
  //    that.pragmas[pragma] = {};
  //    if(options) {
  //      var opts = options.split("=");
  //      that.pragmas[pragma][opts[0]] = opts[1];
  //    }
  //    return "";
  //    // ignore unknown pragmas silently
  //  });
  //},

  // Tries to find a partial in the current scope and render it
  render_partial: function(name, context, partials) {
    if(!partials || partials[name] === undefined) {
      throw({message: "unknown_partial '" + name + "'"});
    }
    if(typeof(context[name]) != "object") {
      return this.render(partials[name], context, partials, true);
    }
    return this.render(partials[name], context[name], partials, true);
  },

  // Renders inverted (^) and normal (#) sections
  render_section: function(template, context, partials) {
    if(!this.includes("#", template) && !this.includes("^", template)) {
      return template;
    }

    var that = this;
    // CSW - Added "+?" so it finds the tighest bound, not the widest
    var regex = new RegExp(this.otag + "(\\^|\\#)\\s*(.+)\\s*" + this.ctag +
            "\n*([\\s\\S]+?)" + this.otag + "\\/\\s*\\2\\s*" + this.ctag +
            "\\s*", "mg");

    // for each {{#foo}}{{/foo}} section do...
    return template.replace(regex, function(match, type, name, content) {
      var value = that.find(name, context);
      if(type == "^") { // inverted section
        if(!value || that.is_array(value) && value.length === 0) {
          // false or empty list, render it
          return that.render(content, context, partials, true);
        } else {
          return "";
        }
      } else if(type == "#") { // normal section
        if(that.is_array(value)) { // Enumerable, Let's loop!
          return that.map(value, function(row) {
            return that.render(content, that.create_context(row),
              partials, true);
          }).join("");
        } else if(that.is_object(value)) { // Object, Use it as subcontext!
          return that.render(content, that.create_context(value),
            partials, true);
        } else if(typeof value === "function") {
          // higher order section
          return value.call(context, content, function(text) {
            return that.render(text, context, partials, true);
          });
        } else if(value) { // boolean section
          return that.render(content, context, partials, true);
        } else {
          return "";
        }
      }
    });
  },

  // Replace {{foo}} and friends with values from our view
  render_tags: function(template, context, partials, in_recursion) {
    // tit for tat
    var that = this;

    var new_regex = function() {
      return new RegExp(that.otag + "(=|!|>|\\{|%)?([^\\/#\\^]+?)\\1?" +
        that.ctag + "+", "g");
    };

    var regex = new_regex();
    var tag_replace_callback = function(match, operator, name) {
      switch(operator) {
      case "!": // ignore comments
        return "";
      case "=": // set new delimiters, rebuild the replace regexp
        that.set_delimiters(name);
        regex = new_regex();
        return "";
      case ">": // render partial
        return that.render_partial(name, context, partials);
      case "{": // the triple mustache is unescaped
        return that.find(name, context);
      default: // escape the value
        return that.escape(that.find(name, context));
      }
    };
    var lines = template.split("\n");
    for(var i = 0; i < lines.length; i++) {
      lines[i] = lines[i].replace(regex, tag_replace_callback, this);
      if(!in_recursion) {
        this.send(lines[i]);
      }
    }

    if(in_recursion) {
      return lines.join("\n");
    }
  },

  set_delimiters: function(delimiters) {
    var dels = delimiters.split(" ");
    this.otag = this.escape_regex(dels[0]);
    this.ctag = this.escape_regex(dels[1]);
  },

  escape_regex: function(text) {
    // thank you Simon Willison
    if(!arguments.callee.sRE) {
      var specials = [
        '/', '.', '*', '+', '?', '|',
        '(', ')', '[', ']', '{', '}', '\\'
      ];
      arguments.callee.sRE = new RegExp(
        '(\\' + specials.join('|\\') + ')', 'g'
      );
    }
    return text.replace(arguments.callee.sRE, '\\$1');
  },

  // Find name in current context
  find: function(name, context) {
    // Checks whether a value is thruthy or false or 0
    function is_kinda_truthy(bool) {
      return bool === false || bool === 0 || bool;
    }

    var value;
    if (is_kinda_truthy(context[name])) {
      value = context[name];
    } else if (is_kinda_truthy(this.context[name])) {
      value = this.context[name];
    }

    if (typeof value === "function") {
      return value.apply(context);
    }
    if (value !== undefined) {
      return value;
    }
    // silently ignore unkown variables
    return "";
  },

  // Utility methods

  // Check if section includes tag
  includes: function(needle, haystack) {
    return haystack.indexOf(this.otag + needle) != -1;
  },

  /*
    Does away with nasty characters
  */
  escape: function(s) {
    s = String(s === null ? "" : s);
    return s.replace(/&(?!\w+;)|["'<>\\]/g, function(s) {
      switch(s) {
      case "&": return "&amp;";
      case "\\": return "\\\\";
      case '"': return '&quot;';
      case "'": return '&#39;';
      case "<": return "&lt;";
      case ">": return "&gt;";
      default: return s;
      }
    });
  },

  // by @langalex, support for arrays of strings
  create_context: function(_context) {
    if(this.is_object(_context)) {
      return _context;
    } else {
      var iterator = ".";
      var ctx = {};
      ctx[iterator] = _context;
      return ctx;
    }
  },

  is_object: function(a) {
    return a && typeof a === "object";
  },

  is_array: function(a) {
    return Object.prototype.toString.call(a) === '[object Array]';
  },

  // Why, why, why? Because IE. Cry, cry cry.
  map: function(array, fn) {
    if (typeof array.map == "function") {
      return array.map(fn);
    } else {
      var r = [];
      var l = array.length;
      for(var i = 0; i < l; i++) {
        r.push(fn(array[i]));
      }
      return r;
    }
  }
};

//  return({
//    name: "mustache.js",
//    version: "0.3.1-dev",
//
//    /*
//      Turns a template and view into HTML
//    */
//    to_html: function(template, view, partials, send_fun) {
//      var renderer = new Renderer();
//      if(send_fun) {
//        renderer.send = send_fun;
//      }
//      renderer.render(template, view, partials);
//      if(!send_fun) {
//        return renderer.buffer.join("\n");
//      }
//    }
//  });
//}();

