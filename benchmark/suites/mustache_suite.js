(function(exports){

var benches = {

  string: {
    source:  "Hello World!",
    context: {}
  },

  replace: {
    source:  "Hello {{name}}! You have {{count}} new messages.",
    context: { name: "Mick", count: 30 }
  },

  array: {
    source:  "{{#names}}{{name}}{{/names}}",
    context: { names: [{name: "Moe"}, {name: "Larry"}, {name: "Curly"}, {name: "Shemp"}] }
  },

  object: {
    source:  "{{#person}}{{name}}{{age}}{{/person}}",
    context: { person: { name: "Larry", age: 45 } }
  },

  partial: {
    source:   "{{#peeps}}{{>replace}}{{/peeps}}",
    context:  { peeps: [{name: "Moe", count: 15}, {name: "Larry", count: 5}, {name: "Curly", count: 1}] },
    partials: { replace: "Hello {{name}}! You have {{count}} new messages." }
  },

  recursion: {
    source:   "{{name}}{{#kids}}{{>recursion}}{{/kids}}",
    context:  {
                name: '1',
                kids: [
                  {
                    name: '1.1',
                    kids: [
                      {name: '1.1.1', kids: []}
                    ]
                  }
                ]
              },
    partials: { recursion: "{{name}}{{#kids}}{{>recursion}}{{/kids}}" }
  },

  filter: {
    source:   "{{#filter}}foo {{bar}}{{/filter}}",
    context:  {
                filter: function() {
                  return function(text, render) {
                    return render(text).toUpperCase();
                  }
                },
                bar: "bar"
              }
  },

  complex: {
    source:  "<h1>{{header}}</h1>{{#hasItems}}<ul>{{#items}}{{#current}}" +
             "<li><strong>{{name}}</strong></li>{{/current}}{{^current}}" +
             "<li><a href=\"{{url}}\">{{name}}</a></li>{{/current}}"      +
             "{{/items}}</ul>{{/hasItems}}{{^hasItems}}<p>The list is empty.</p>{{/hasItems}}",
    context: {
               header: function() {
                 return "Colors";
               },
               items: [
                 {name: "red", current: true, url: "#Red"},
                 {name: "green", current: false, url: "#Green"},
                 {name: "blue", current: false, url: "#Blue"}
               ],
               hasItems: function() {
                 return this.items.length !== 0;
               },
               empty: function() {
                 return this.items.length === 0;
               }
             }
  }
}

exports.mustacheBench = function(suite, name, id) {
  var bench = benches[name],
      src = bench.source,
      ctx = bench.context,
      partials = bench.partials;

  suite.bench(id || name, function(next) {
    Mustache.to_html(src, ctx, partials);
    next();
  });
}

exports.mustacheBench.benches = benches;

})(typeof exports !== "undefined" ? exports : window);