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
    source:   "{{#names}}{{name}}{{/names}}",
    context:  { names: [{name: "Moe"}, {name: "Larry"}, {name: "Curly"}, {name: "Shemp"}] }
  },

  object: {
    source:   "{{#person}}{{name}}{{age}}{{/person}}",
    context:  { person: { name: "Larry", age: 45 } }
  },

  partial: {
    source:   "{{#peeps}}{{>string}}{{/peeps}}",
    context:  { peeps: [{name: "Moe", count: 15}, {name: "Larry", count: 5}, {name: "Curly", count: 1}] },
    partials: { string: "Hello World!" }
  },

  recursion: {
    source:   "{{name}}{{#kids}}{{>recursion}}{{/kids}}",
    context:  {
                name: '1',
                kids: [
                  {
                    name: '1.1',
                    kids: [
                      {name: '1.1.1'}
                    ]
                  }
                ]
              },
    partials: { recursion: "{{name}}{{#kids}}{{>recursion}}{{/kids}}" }
  },

  filter: {
    source:   "{{#filter}}foo {{bar}}{{/filter}}",
    context:  {
                filter: function(options) {
                  return options.fn(this).toUpperCase();
                },
                bar: "bar"
              }
  },

  complex: {
    source:  "<h1>{{header}}</h1><h2>{{>string}}</h2>" +
             "{{#hasItems}}<ul>{{#items}}{{#current}}" +
             "<li><strong>{{name}}</strong></li>{{/current}}{{^current}}" +
             "<li><a href=\"{{url}}\">{{name}}</a></li>{{/current}}"      +
             "{{/items}}</ul>{{^}}<p>The list is empty.</p>{{/hasItems}}",
    context: {
               header: function() {
                 return "Colors";
               },
               items: [
                 {name: "red", current: true, url: "#Red"},
                 {name: "green", current: false, url: "#Green"},
                 {name: "blue", current: false, url: "#Blue"}
               ],
               hasItems: function(options) {
                 if (this.items.length) {
                   return options.fn(this);
                 }
               }
             },
    partials: { string: "Hello World!" }
  }

}

exports.handlebarsBench = function(suite, type, name, id) {
  var bench = benches[name],
      fn = Handlebars.compile(bench.source),
      ctx = bench.context,
      src = bench.source,
      partials = bench.partials;

  if (partials) {
    for (var key in partials) {
      Handlebars.registerPartial(key, partials[key]);
    }
  }

  if (type === 'compile') {
    suite.bench(id || name, function(next) {
      Handlebars.compile(src);
      next();
    });
  } else if (type === 'render') {
    suite.bench(id || name, function(next) {
      fn(ctx);
      next();
    });
  }
}

exports.handlebarsBench.benches = benches;

})(typeof exports !== "undefined" ? exports : window);
