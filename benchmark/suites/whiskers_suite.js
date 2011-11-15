(function(exports){

var benches = {

  string: {
    source:  "Hello World!",
    context: {}
  },

  replace: {
    source:  "Hello {name}! You have {count} new messages.",
    context: { name: "Mick", count: 30 }
  },

  array: {
    source:  "{#names}{name}{/names}",
    context: { names: [{name: "Moe"}, {name: "Larry"}, {name: "Curly"}, {name: "Shemp"}] }
  },

  object: {
    source:  "{person.name}{person.age}",
    context: { person: { name: "Larry", age: 45 } }
  },

  partial: {
    source:   "{#peeps}{>replace}{/peeps}",
    context:  { peeps: [{name: "Moe", count: 15}, {name: "Larry", count: 5}, {name: "Curly", count: 1}] },
    partials: { replace: "Hello {name}! You have {count} new messages." }
  },

  complex: {
    source:  "<h1>{header}</h1>{?items}<ul>{#items}{?current}" +
             "<li><strong>{name}</strong></li>{^current}" +
             "<li><a href=\"{url}\">{name}</a></li>{/if}" +
             "{/current}</ul>{^items}<p>The list is empty.</p>{/items}",
    context: {
               header: function() {
                 return "Colors";
               },
               items: [
                 {name: "red", current: true, url: "#Red"},
                 {name: "green", current: false, url: "#Green"},
                 {name: "blue", current: false, url: "#Blue"}
               ]
             }
  }
}

exports.whiskersBench = function(suite, name, id) {
  var bench = benches[name],
      src = bench.source,
      ctx = bench.context,
      partials = bench.partials;

  suite.bench(id || name, function(next) {
    whiskers.render(src, ctx, partials);
    next();
  });
}

exports.whiskersBench.benches = benches;

})(typeof exports !== "undefined" ? exports : window);
