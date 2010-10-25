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
    context: { names: [
                 { name: "Moe" },
                 { name: "Larry" },
                 { name: "Curly" },
                 { name: "Shemp" }
               ]
             }
  },

  object: {
    source:  "{#person}{name}{age}{/person}",
    context: { person: { name: "Larry", age: 45 } }
  },

  partial: {
    source:  "{#peeps}{>replace/}{/peeps}",
    context: { peeps: [
                 { name: "Moe", count: 15 },
                 { name: "Larry", count: 5 },
                 { name: "Curly", count: 0 }
               ]
             }
  },

  recursion: {
    source:  "{name}{#kids}{>recursion:./}{/kids}",
    context: {
                name: '1',
                kids: [
                  {
                    name: '1.1',
                    kids: [
                      {name: '1.1.1'}
                    ]
                  }
                ]
             }
  },

  filter: {
    source:  "{#filter}foo {bar}{/filter}",
    context: {
                filter: function(chunk, context, bodies) {
                  return chunk.tap(function(data) {
                    return data.toUpperCase();
                  }).render(bodies.block, context).untap();
                },
                bar: "bar"
             }
  },

  complex: {
    source:  "<h1>{header}</h1>\n"                             +
             "{?items}\n"                                      +
             "  <ul>\n"                                        +
             "    {#items}\n"                                  +
             "      {#current}\n"                              +
             "        <li><strong>{name}</strong></li>\n"      +
             "      {:else}\n"                                 +
             "        <li><a href=\"{url}\">{name}</a></li>\n" +
             "      {/current}\n"                              +
             "    {/items}\n"                                  +
             "  </ul>\n"                                       +
             "{:else}\n"                                       +
             "  <p>The list is empty.</p>\n"                   +
             "{/items}",
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

exports.dustBench = function(suite, name, id) {
  var bench = benches[name],
      ctx = bench.context;

  dust.loadSource(dust.compile(bench.source, name));
  suite.bench(id || name, function(next) {
    dust.render(name, ctx, function() {
      next();
    });
  });
};

exports.dustBench.benches = benches;

})(typeof exports !== "undefined" ? exports : window);