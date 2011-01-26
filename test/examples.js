(function(exports){

exports.dustExamples = [
  {
    name:     "intro",
    source:   "{#stream}{#delay}{.}{/delay}{/stream}",
    context:  (function(){
                var d = 1;
                return {
                  stream: function() {
                    return "asynchronous templates for the browser and node.js".split('');
                  },
                  delay: function(chunk, context, bodies) {
                    return chunk.map(function(chunk) {
                      setTimeout(function() {
                        chunk.render(bodies.block, context).end();
                      }, d++ * 15);
                    });
                  }
                }
              })
  },
  {
    name:     "plain",
    source:   "Hello World!",
    context:  {},
    expected: "Hello World!"
  },
  {
    name:     "replace",
    source:   "Hello {name}! You have {count} new messages.",
    context:  { name: "Mick", count: 30 },
    expected: "Hello Mick! You have 30 new messages."
  },
  {
    name:     "zero",
    source:   "{#zero}{.}{/zero}",
    context:  { zero: 0 },
    expected: "0"
  },
  {
    name:     "array",
    source:   "{#names}{title} {name}{~n}{/names}",
    context:  { title: "Sir", names: [ { name: "Moe" }, { name: "Larry" }, { name: "Curly" } ] },
    expected: "Sir Moe\nSir Larry\nSir Curly\n"
  },
  {
    name:     "empty_array",
    source:   "{#names}{title} {name}{~n}{/names}",
    context:  { title: "Sir", names: [] },
    expected: ""
  },
  {
    name:     "implicit",
    source:   "{#names}{.}{~n}{/names}",
    context:  { names: ["Moe", "Larry", "Curly"] },
    expected: "Moe\nLarry\nCurly\n"
  },
  {
    name:     "object",
    source:   "{#person}{root}: {name}, {age}{/person}",
    context:  { root: "Subject", person: { name: "Larry", age: 45 } },
    expected: "Subject: Larry, 45"
  },
  {
    name:     "rename_key",
    source:   "{#person foo=root}{foo}: {name}, {age}{/person}",
    context:  { root: "Subject", person: { name: "Larry", age: 45 } },
    expected: "Subject: Larry, 45"
  },
  {
    name:     "force_current",
    source:   "{#person}{.root}: {name}, {age}{/person}",
    context:  { root: "Subject", person: { name: "Larry", age: 45 } },
    expected: ": Larry, 45"
  },
  {
    name:     "path",
    source:   "{foo.bar}",
    context:  { foo: {bar: "Hello!"} },
    expected: "Hello!"
  },
  {
    name:     "escaped",
    source:   "{safe|s}{~n}{unsafe}",
    context:  { safe: "<script>alert('Hello!')</script>", unsafe: "<script>alert('Goodbye!')</script>" },
    expected: "<script>alert('Hello!')</script>\n&lt;script&gt;alert('Goodbye!')&lt;/script&gt;"
  },
  {
    name:     "escape_pragma",
    source:   "{%esc:s}\n  {unsafe}{~n}\n  {%esc:h}\n    {unsafe}\n  {/esc}\n{/esc}",
    context:  { unsafe: "<script>alert('Goodbye!')</script>" },
    expected: "<script>alert('Goodbye!')</script>\n&lt;script&gt;alert('Goodbye!')&lt;/script&gt;"
  },
  {
    name:     "else_block",
    source:   "{#foo}\n"         +
              "  foo,{~s}\n"     +
              "{:else}\n"        +
              "  not foo,{~s}\n" +
              "{/foo}\n"         +
              "{#bar}\n"         +
              "  bar!\n"         +
              "{:else}\n"        +
              "  not bar!\n"     +
              "{/bar}",
    context:  { foo: true, bar: false },
    expected: "foo, not bar!"
  },
  {
    name:     "conditional",
    source:   "{?tags}\n"                     +
              "  <ul>{~n}\n"                  +
              "    {#tags}\n"                 +
              "      {~s} <li>{.}</li>{~n}\n" +
              "    {/tags}\n"                 +
              "  </ul>\n"                     +
              "{:else}\n"                     +
              "  No Tags!\n"                  +
              "{/tags}\n"                     +
              "{~n}\n"                        +
              "{^likes}\n"                    +
              "  No Likes!\n"                 +
              "{:else}\n"                     +
              "  <ul>{~n}\n"                  +
              "    {#likes}\n"                +
              "      {~s} <li>{.}</li>{~n}\n" +
              "    {/likes}\n"                +
              "  </ul>\n"                     +
              "{/likes}",
    context:  { tags: [], likes: ["moe", "larry", "curly", "shemp"] },
    expected: "No Tags!\n"                    +
              "<ul>\n"                        +
              "  <li>moe</li>\n"              +
              "  <li>larry</li>\n"            +
              "  <li>curly</li>\n"            +
              "  <li>shemp</li>\n"            +
              "</ul>"
  },
  {
    name:     "sync_key",
    source:   "Hello {type} World!",
    context:  {
                type: function(chunk) {
                  return "Sync";
                }
              },
    expected: "Hello Sync World!"
  },
  {
    name:     "async_key",
    source:   "Hello {type} World!",
    context:  {
                type: function(chunk) {
                  return chunk.map(function(chunk) {
                    dust.nextTick(function() {
                      chunk.end("Async");
                    });
                  });
                }
              },
    expected: "Hello Async World!"
  },
  {
    name:     "sync_chunk",
    source:   "Hello {type} World!",
    context:  {
                type: function(chunk) {
                  return chunk.write("Chunky");
                }
              },
    expected: "Hello Chunky World!"
  },
  {
    name:     "async_iterator",
    source:   "{#numbers}{#delay}{.}{/delay}{@sep}, {/sep}{/numbers}",
    context:  {
                numbers: [3, 2, 1],
                delay: function(chunk, context, bodies) {
                  return chunk.map(function(chunk) {
                    setTimeout(function() {
                      chunk.render(bodies.block, context).end();
                    }, Math.ceil(Math.random()*10));
                  });
                }
              },
    expected: "3, 2, 1"
  },
  {
    name:     "filter",
    source:   "{#filter}foo {bar}{/filter}",
    context:  {
                filter: function(chunk, context, bodies) {
                  return chunk.tap(function(data) {
                    return data.toUpperCase();
                  }).render(bodies.block, context).untap();
                },

                bar: "bar"
              },
    expected: "FOO BAR"
  },
  {
    name:     "context",
    source:   "{#list:projects}{name}{:else}No Projects!{/list}",
    context:  {
                list: function(chunk, context, bodies) {
                  var items = context.current(),
                      len   = items.length;

                  if (len) {
                    chunk.write("<ul>\n");
                    for (var i=0; i<len; i++) {
                      chunk = chunk.write("<li>")
                        .render(bodies.block, context.push(items[i]))
                        .write("</li>\n");
                    }
                    return chunk.write("</ul>");
                  } else if (bodies['else']) {
                    return chunk.render(bodies['else'], context);
                  }
                  return chunk;
                },

                projects: [
                  {name: "Mayhem"},
                  {name: "Flash"},
                  {name: "Thunder"}
                ]
              },
    expected: "<ul>\n"             +
              "<li>Mayhem</li>\n"  +
              "<li>Flash</li>\n"   +
              "<li>Thunder</li>\n" +
              "</ul>"
  },
  {
    name:     "params",
    source:   "{#helper foo=\"bar\"/}",
    context:  {
                helper: function(chunk, context, bodies, params) {
                  return chunk.write(params.foo);
                }
              },
    expected: "bar"
  },
  {
    name:     "partials",
    source:   '{>replace/} {>"plain"/} {>"{ref}"/}',
    context:  { name: "Jim", count: 42, ref: "plain" },
    expected: "Hello Jim! You have 42 new messages. Hello World! Hello World!"
  },
  {
    name:     "partial_context",
    source:   "{>replace:.profile/}",
    context:  { profile: { name: "Mick", count: 30 } },
    expected: "Hello Mick! You have 30 new messages."
  },
  {
    name:     "base_template",
    source:   "Start{~n}\n"       +
              "{+title}\n"        +
              "  Base Title\n"    +
              "{/title}\n"        +
              "{~n}\n"            +
              "{+main}\n"         +
              "  Base Content\n"  +
              "{/main}\n"         +
              "{~n}\n"            +
              "End",
    context:  {},
    expected: "Start\nBase Title\nBase Content\nEnd"
  },
  {
    name:     "child_template",
    source:   "{^xhr}\n"              +
              "  {>base_template/}\n" +
              "{:else}\n"             +
              "  {+main/}\n"          +
              "{/xhr}\n"              +
              "{<title}\n"            +
              "  Child Title\n"       +
              "{/title}\n"            +
              "{<main}\n"             +
              "  Child Content\n"     +
              "{/main}\n",
    context:  {xhr: false},
    expected: "Start\nChild Title\nChild Content\nEnd"
  },
  {
    name:     "recursion",
    source:   "{name}{~n}{#kids}{>recursion:./}{/kids}",
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
    expected: "1\n1.1\n1.1.1\n"
  },
  {
    name:     "comments",
    source:   "{!\n"                      +
              "  Multiline\n"             +
              "  {#foo}{bar}{/foo}\n"     +
              "!}\n"                      +
              "{!before!}Hello{!after!}",
    context:  {},
    expected: "Hello"
  }
];

})(typeof exports !== "undefined" ? exports : window);