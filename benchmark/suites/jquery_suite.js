(function(exports){

var benches = {

  string: {
    source:  "Hello World!",
    context: {}
  },

  replace: {
    source:  "Hello ${name}! You have ${count} new messages.",
    context: { name: "Mick", count: 30 }
  },

  array: {
    source:  "{{each names}}${name}{{/each}}",
    context: { names: [{name: "Moe"}, {name: "Larry"}, {name: "Curly"}, {name: "Shemp"}] }
  },

  object: {
    source:  "${person.name}${person.age}",
    context: { person: { name: "Larry", age: 45 } }
  },

  partial: {
    source:   "{{tmpl(peeps) \"replace\"}}",
    context:  { peeps: [{name: "Moe", count: 15}, {name: "Larry", count: 5}, {name: "Curly", count: 1}] }
  },

  recursion: {
    source:   "${name}{{tmpl(kids) \"recursion\"}}",
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
              }
  },

  filter: {
    source:   "FOO ${bar.toUpperCase()}",
    context:  {
                bar: "bar"
              }
  },

  complex: {
    source:  "<h1>${header}</h1>{{if items.length}}<ul>{{each items}}{{if current}}" +
             "<li><strong>${name}</strong></li>{{else}}" +
             "<li><a href=\"${url}\">${name}</a></li>{{/if}}"      +
             "{{/each}}</ul>{{else}}<p>The list is empty.</p>{{/if}}",
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

exports.jqueryBench = function(suite, name, id) {
  var bench = benches[name],
      fn = $.template(name, bench.source),
      ctx = bench.context;

  suite.bench(id || name, function(next) {
    $.tmpl(fn, ctx);
    next();
  });
}

exports.jqueryBench.benches = benches;

})(typeof exports !== "undefined" ? exports : window);