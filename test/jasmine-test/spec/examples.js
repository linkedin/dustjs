var dustExamples = [
  {
    name: "error",
    source: "RRR {##}",
    context: { name: "Mick", count: 30 },
    error: 'Expected buffer, comment, partial, reference, section or special but "{" found. At line : 1, column : 5',
    message: "should test that the error message shows line and column."
  },
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
              }),
    expected: '',
    message: "should test the stream tag"
  },
  {
    name:     "plain",
    source:   "Hello World!",
    context:  {},
    expected: "Hello World!",
    message: "should test basic"
  },
  {
    name:     "replace",
    source:   "Hello {name}! You have {count} new messages.",
    context:  { name: "Mick", count: 30 },
    expected: "Hello Mick! You have 30 new messages.",
    message: "should test a basic replace"
  },
  {
    name:     "zero",
    source:   "{#zero}{.}{/zero}",
    context:  { zero: 0 },
    expected: "0",
    message: "should test one basic section"
  },
  {
    name:     "array",
    source:   "{#names}{title} {name}{~n}{/names}",
    context:  { title: "Sir", names: [ { name: "Moe" }, { name: "Larry" }, { name: "Curly" } ] },
    expected: "Sir Moe\nSir Larry\nSir Curly\n",
    message: "should test an array"
  },
  {
     name:     "array",
     source:   "{#names}({$idx}).{title} {name}{~n}{/names}",
     context:  { title: "Sir", names: [ { name: "Moe" }, { name: "Larry" }, { name: "Curly" } ] },
     expected: "(0).Sir Moe\n(1).Sir Larry\n(2).Sir Curly\n",
     message: "should test an array"
   },
  {
      name:     "array",
      source:   "{#names}Size=({$len}).{title} {name}{~n}{/names}",
      context:  { title: "Sir", names: [ { name: "Moe" }, { name: "Larry" }, { name: "Curly" } ] },
      expected: "Size=(3).Sir Moe\nSize=(3).Sir Larry\nSize=(3).Sir Curly\n",
      message: "should test an array"
  },
  {
    name:     "empty_array",
    source:   "{#names}{title} {name}{~n}{/names}",
    context:  { title: "Sir", names: [] },
    expected: "",
    message: "should test an empty array"
  },
  {
    name:     "implicit",
    source:   "{#names}{.}{~n}{/names}",
    context:  { names: ["Moe", "Larry", "Curly"] },
    expected: "Moe\nLarry\nCurly\n",
    message: "should test an implicit array"
  },
  {
    name:     "object",
    source:   "{#person}{root}: {name}, {age}{/person}",
    context:  { root: "Subject", person: { name: "Larry", age: 45 } },
    expected: "Subject: Larry, 45",
    message: "should test an object"
  },
  {
    name:     "rename_key",
    source:   "{#person foo=root}{foo}: {name}, {age}{/person}",
    context:  { root: "Subject", person: { name: "Larry", age: 45 } },
    expected: "Subject: Larry, 45",
    message: "should test renaming a key"
  },
  {
    name:     "force_current",
    source:   "{#person}{.root}: {name}, {age}{/person}",
    context:  { root: "Subject", person: { name: "Larry", age: 45 } },
    expected: ": Larry, 45",
    message: "should test force a key"
  },
  {
    name:     "path",
    source:   "{foo.bar}",
    context:  { foo: {bar: "Hello!"} },
    expected: "Hello!",
    message: "should test an object path"
  },
  {
    name:     "escaped",
    source:   "{safe|s}{~n}{unsafe}",
    context:  { safe: "<script>alert('Hello!')</script>", unsafe: "<script>alert('Goodbye!')</script>" },
    expected: "<script>alert('Hello!')</script>\n&lt;script&gt;alert('Goodbye!')&lt;/script&gt;",
    message: "should test escaped characters"
  },
  {
    name:     "escape_pragma",
    source:   "{%esc:s}\n  {unsafe}{~n}\n  {%esc:h}\n    {unsafe}\n  {/esc}\n{/esc}",
    context:  { unsafe: "<script>alert('Goodbye!')</script>" },
    expected: "<script>alert('Goodbye!')</script>\n&lt;script&gt;alert('Goodbye!')&lt;/script&gt;",
    message: "should test escape_pragma"
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
    expected: "foo, not bar!",
    message:"should test the else block"
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
              "</ul>",
    message: "should test conditional tags"
  },
  {
    name:     "sync_key",
    source:   "Hello {type} World!",
    context:  {
                type: function(chunk) {
                  return "Sync";
                }
              },
    expected: "Hello Sync World!",
    message: "should test sync key"
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
    expected: "Hello Async World!",
    message: "should test async key"
  },
  {
    name:     "sync_chunk",
    source:   "Hello {type} World!",
    context:  {
                type: function(chunk) {
                  return chunk.write("Chunky");
                }
              },
    expected: "Hello Chunky World!",
    message: "should test sync chunk"
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
    expected: "3, 2, 1",
    message: "should test async iterator"
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
    expected: "FOO BAR",
    message: "should test the filter tag"
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
              "</ul>",
    message: "should test the context"
  },
  {
    name:     "params",
    source:   "{#helper foo=\"bar\"/}",
    context:  {
                helper: function(chunk, context, bodies, params) {
                  return chunk.write(params.foo);
                }
              },
    expected: "bar",
    message: "should test inner params"
  },
  {
    name:     "partials",
    source:   '{>replace/} {>"plain"/} {>"{ref}"/}',
    context:  { name: "Jim", count: 42, ref: "plain" },
    expected: "Hello Jim! You have 42 new messages. Hello World! Hello World!",
    message: "should test partials"
  },
  {
    name:     "partial_context",
    source:   "{>replace:.profile/}",
    context:  { profile: { name: "Mick", count: 30 } },
    expected: "Hello Mick! You have 30 new messages.",
    message: "should test partial context"
  },
  {
    name:     "partial_param",
    source:   '{>replace name=n count="{c}"/}',
    context:  { n: "Mick", c: 30 },
    expected: "Hello Mick! You have 30 new messages.",
    message: "should test partial params"
  },
  {name:     "partial_array_param",
    source:   '{#n}{>replace name=. count="30"/}{@sep} {/sep}{/n}',
    context:  { n: ["Mick", "Tom", "Bob"] },
    expected: "Hello Mick! You have 30 new messages. Hello Tom! You have 30 new messages. Hello Bob! You have 30 new messages.",
    message: "should test partial params using an array"
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
    expected: "Start\nBase Title\nBase Content\nEnd",
    message: "should test base template"
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
    expected: "Start\nChild Title\nChild Content\nEnd",
    message: "should test child template"
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
    expected: "1\n1.1\n1.1.1\n",
    message: "should test recursion"
  },
  {
    name:     "comments",
    source:   "{!\n"                      +
              "  Multiline\n"             +
              "  {#foo}{bar}{/foo}\n"     +
              "!}\n"                      +
              "{!before!}Hello{!after!}",
    context:  {},
    expected: "Hello",
    message: "should test comments"
  },
  {
    name:     "@if helper",
    source:   '{@if cond="{x}<{y}"}<div> X < Y </div>{/if}',  
    context:  { x: 2, y: 3 },
    expected: "<div> X < Y </div>",
    message: "should test the simplest case of @if helper (if without else)"
  },
  {
    name:     "@if helper",
    source:   '{@if cond=" \'{x}\'.length && \'{y}\'.length "}<div> X and Y exists </div>{:else}<div> X and Y does not exists </div>{/if}',  
    context:  {},
    expected: "<div> X and Y does not exists </div>",
    message: "should test the simplest case of @if helper with else using and"
  },
  {
    name:     "@if helper",
    source:   '{@if cond=" \'{x}\'.length || \'{y}\'.length "}<div> X or Y exists </div>{:else}<div> X or Y does not exists </div>{/if}',  
    context:  { x: 1},
    expected: "<div> X or Y exists </div>",
    message: "should test the simplest case of @if helper with else using or"
  },
  {
    name:     "@if helper",
    source:   '{@if cond="( \'{x}\'.length ) && ({x}<3)"}<div> X exists and is 1 </div>{:else}<div> x is not there </div>{/if}',  
    context:  { x : 1},
    expected: "<div> X exists and is 1 </div>",
    message: "should test the simplest case of @if helper with else using exists /and"
  },
  {
    name:     "@if helper",
    source:   '{#list}{@if cond="( {$idx} == 1 )"}<div>{y}</div>{/if}{/list}',  
    context:  { x : 1, list: [ { y: 'foo' }, { y: 'bar'} ]},
    expected: "<div>bar</div>",
    message: "should test the use of $idx in @if helper condition"
  },
  
];

if (typeof module !== "undefined" && typeof require !== "undefined") {
    module.exports = dustExamples; // We're on node.js
} else {
    window.dustExamples = dustExamples; // We're on the browser
}
