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
    expected: "<script>alert('Hello!')</script>\n&lt;script&gt;alert(&#39;Goodbye!&#39;)&lt;/script&gt;",
    message: "should test escaped characters"
  },
  {
    name:     "escape_pragma",
    source:   "{%esc:s}\n  {unsafe}{~n}\n  {%esc:h}\n    {unsafe}\n  {/esc}\n{/esc}",
    context:  { unsafe: "<script>alert('Goodbye!')</script>" },
    expected: "<script>alert('Goodbye!')</script>\n&lt;script&gt;alert(&#39;Goodbye!&#39;)&lt;/script&gt;",
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
  {name:     "partial_context_param",
    source:   '{>replace:profile name="{n}" count="{c}"/}',
    context:  { profile:  { n: "Mick", c: 30 } },
    expected: "Hello Mick! You have 30 new messages.",
    message: "should test partial params with context"
  },
  {name:     "partial_context_param_literal",
    source:   '{>replace:profile name="Joe" count="99"/}',
    context:  { profile:  { n: "Mick", count: 30 } },
    expected: "Hello Joe! You have 30 new messages.",
    message: "should test partial params with context. Fallback values of name or count is undefined"
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
  {
    name:     "whitespaces in open tags for sections, it works equal for all these cases '{#', '{?', '{^', '{<', '{+', '{@', '{%'",
    source:   '{# helper foo="bar" boo="boo" } {/helper}',  
    context:  { "helper": function(chunk, context, bodies, params) { return chunk.write(params.boo + " " + params.foo); } },
    expected: "boo bar",
    message: "should ignore extra whitespaces after the open curly bracket followed by any of this characters #,?,^,+,@,%"
  },
  {
    name:     "whitespaces between the '{' and the symbol in open tags for sections, it works equal for all these cases '{#', '{?', '{^', '{<', '{+', '{@', '{%'",
    source:   '{ # helper foo="bar" boo="boo" } {/helper}',  
    context:  { "helper": function(chunk, context, bodies, params) { return chunk.write(params.boo + " " + params.foo); } },
    error: 'Expected buffer, comment, partial, reference, section or special but "{" found. At line : 1, column : 34',
    message: "should show an error because whitespaces between the '{' and the symbol are not allowed in open tags"
  },
  {
    name:     "whitespaces in close tags for sections, it works equal for all these cases '{#', '{?', '{^', '{<', '{+', '{@', '{%'",
    source:   '{# helper foo="bar" boo="boo"} {/ helper }',
    context:  { "helper": function(chunk, context, bodies, params) { return chunk.write(params.boo + " " + params.foo); } },
    expected: "boo bar",
    message: "should ignore extra whitespaces after the open curly bracket followed by the slash and ignore ws before the close curly bracket"
  },
  {
    name:     "whitespaces between the open curly bracket and the slash in close tags for sections",
    source:   '{# helper foo="bar" boo="boo"} { / helper }',
    context:  { "helper": function(chunk, context, bodies, params) { return chunk.write(params.boo + " " + params.foo); } },
    error: 'Expected buffer, comment, partial, reference, section or special but "{" found. At line : 1, column : 1',
    message: "should show an error because whitespaces between the '{' and the slash are not allowed in close tags"
  },
  {
    name:     "whitespaces in self closing tags",
    source:   '{#helper foo="bar" boo="boo" /}',
    context:  { "helper": function(chunk, context, bodies, params) { return chunk.write(params.boo + " " + params.foo); } },
    expected: "boo bar",
    message: "should ignore extra whitespaces in self closing tags"
  },
  {
    name:     "whitespaces between the slash and the close curly bracket in self closed tags",
    source:   '{#helper foo="bar" boo="boo" / }',
    context:  { "helper": function(chunk, context, bodies, params) { return chunk.write(params.boo + " " + params.foo); } },
    error: 'Expected buffer, comment, partial, reference, section or special but "{" found. At line : 1, column : 1',
    message: "should show an error because whitespaces between the slash and the '}' are not allowed in self closed tags"
  },
  {
    name: "whitespaces between params",
    source: '{#helper foo="bar"   boo="boo"/}',
    context: { "helper": function(chunk, context, bodies, params) { return chunk.write(params.boo + " " + params.foo); } },
    expected: "boo bar",
    message: "should ignore extra whitespaces between params"
  },
  {
    name: "whitespaces after the '{' followed by '>' symbol in open tags for partials are not allowed",
    source: '{> replace/} {> "plain"/} {> "{ref}"/}',
    context: { "name": "Jim", "count": 42, "ref": "plain" },
    error: 'Expected buffer, comment, partial, reference, section or special but "{" found. At line : 1, column : 1',
    message: "should show an error because extra whitespaces after the '{' followed by '>'' symbol are not allowed in open tags for partials"
  },
  {
    name: "whitespaces in close tags for partials",
    source: '{>replace /} {>"plain" /} {>"{ref}" /}',  
    context: { "name": "Jim", "count": 42, "ref": "plain" },
    expected: "Hello Jim! You have 42 new messages. Hello World! Hello World!",
    message: "should ignore extra whitespaces before the slash followed by the close curly bracket"
  },
  {
    name:     "Accessing array by index",
    source:   '{do.re[0]}',  
    context:  { "do": { "re" : ["hello!","bye!"] } },
    expected: "hello!",
    message: "should return a specific array element by index. Simplest case, the array only contains primitive values."
  },
  {
    name:     "Accessing array by index",
    source:   '{do.re[0].mi}',  
    context:  { "do": { "re" : [{"mi" : "hello!"},"bye!"] } },
    expected: "hello!",
    message: "should return a specific array element by index. Complex case, the array contains objects."
  },
  {
    name:     "Accessing array by index",
    source:   '{do.re[0].mi[1].fa}',  
    context:  { "do": { "re" : [{"mi" : ["one", {"fa" : "hello!"}]},"bye!"] } },
    expected: "hello!",
    message: "should return a specific array element by index. Most Complex case, the array contains nested objects."
  },
  {
    name:     "Accessing array by index",
    source:   '{do[0]}',  
    context:  { "do": ["lala", "lele"] },
    expected: "lala",
    message: "should return a specific array element by index. Root context object as array."
  },
  {
    name:     "params: integer",
    source:   "{#helper foo=10 /}",
    context:  { helper: function(chunk, context, bodies, params) { return chunk.write(params.foo); } },
    expected: "10",
    message: "Block handlers syntax should support integer number parameters"
  },
  {
    name:     "params: decimal",
    source:   "{#helper foo=3.14159 /}",
    context:  { helper: function(chunk, context, bodies, params) { return chunk.write(params.foo); } },
    expected: "3.14159",
    message: "Block handlers syntax should support decimal number parameters"
  },
  {
    name:     "JSON.stringify filter",
    source:   "{obj|js|s}",
    context:  { obj: { id: 1, name: "bob", occupation: "construction" } },
    expected: JSON.stringify({ id: 1, name: "bob", occupation: "construction" }),
    message: "should stringify a JSON literal when using the js filter"
  },
  {
    name:     "JSON.parse filter",
    source:   "{obj|jp}",
    context:  { obj: JSON.stringify({ id: 1, name: "bob", occupation: "construction" }) },
    expected: JSON.parse(JSON.stringify({ id: 1, name: "bob", occupation: "construction" })).toString(),
    message: "should objectify a JSON string when using the jp filter"
  },
  {
    name:     "select helper: one condition - eq",
    source:   ["{@select key=\"foo\"}",
                 "{@eq value=10}foobar{/eq}",
               "{/select}"
              ].join("\n"),
    context:  { foo: 10 },
    expected: "foobar",
    message: "Select helper works with one condition (eq)"
  },
  {
    name:     "select helper: one condition - lt",
    source:   ["{@select key=\"foo\"}",
                 "{@lt value=20}foobar{/lt}",
               "{/select}"
              ].join("\n"),
    context:  { foo: 10 },
    expected: "foobar",
    message: "Select helper works with one condition (lt)"
  },
  {
    name:     "select helper: one condition - lte",
    source:   ["{@select key=\"foo\"}",
                 "{@lte value=10}foobar{/lte}",
               "{/select}"
              ].join("\n"),
    context:  { foo: 10 },
    expected: "foobar",
    message: "Select helper works with one condition (lte)"
  },
  {
    name:     "select helper: one condition - lte",
    source:   ["{@select key=\"foo\"}",
                 "{@lte value=11}foobar{/lte}",
               "{/select}"
              ].join("\n"),
    context:  { foo: 10 },
    expected: "foobar",
    message: "Select helper works with one condition (lte)"
  },
  {
    name:     "select helper: one condition - gt",
    source:   ["{@select key=\"foo\"}",
                 "{@gt value=5}foobar{/gt}",
               "{/select}"
              ].join("\n"),
    context:  { foo: 10 },
    expected: "foobar",
    message: "Select helper works with one condition (gt)"
  },
  {
    name:     "select helper: one condition - gte",
    source:   ["{@select key=\"foo\"}",
                 "{@gte value=10}foobar{/gte}",
               "{/select}"
              ].join("\n"),
    context:  { foo: 10 },
    expected: "foobar",
    message: "Select helper works with one condition (gte)"
  },
  {
    name:     "select helper: one condition - gte",
    source:   ["{@select key=\"foo\"}",
                 "{@gte value=5}foobar{/gte}",
               "{/select}"
              ].join("\n"),
    context:  { foo: 10 },
    expected: "foobar",
    message: "Select helper works with one condition (gte)"
  },
  {
    name:     "select helper: one condition - number",
    source:   ["{@select key=\"foo\"}",
                 "{@eq value=10}foobar{/eq}",
               "{/select}"
              ].join("\n"),
    context:  { foo: 10 },
    expected: "foobar",
    message: "Select helper works with one condition of type number (eq)"
  },
  {
    name:     "select helper: one condition - string",
    source:   ["{@select key=\"foo\"}",
                 "{@eq value=\"bar\"}foobar{/eq}",
               "{/select}"
              ].join("\n"),
    context:  { foo: "bar" },
    expected: "foobar",
    message: "Select helper works with one condition of type string (eq)"
  },
  {
    name:     "select helper: two conditions",
    source:   ["{@select key=\"foo\"}",
                 "{@eq value=\"bar\"}foobar{/eq}",
                 "{@eq value=\"baz\"}foobaz{/eq}",
               "{/select}"
              ].join("\n"),
    context:  { foo: "baz" },
    expected: "foobaz",
    message: "Select helper works with two conditions"
  },
  {
    name:     "select helper: three conditions with else",
    source:   ["{@select key=\"foo\"}",
                 "{@eq value=\"bar\"}foobar{/eq}",
                 "{@eq value=\"baz\"}foobaz{/eq}",
                 "{@eq value=\"foobar\"}foofoobar{/eq}",
                 "{@else value=\"foo\"}foofoo{/else}",
               "{/select}"
              ].join("\n"),
    context:  { foo: "foo" },
    expected: "foofoo",
    message: "Select helper works with three conditions with else"
  },
  {
    name:     "select helper: no matching conditions",
    source:   ["{@select key=\"foo\"}",
                 "{@eq value=\"bar\"}foobar{/eq}",
                 "{@eq value=\"baz\"}foobaz{/eq}",
               "{/select}"
              ].join("\n"),
    context:  { foo: "foo" },
    expected: "",
    message: "Select helper works correctly with no matching conditions"
  },
  {
    name:     "select helper: using tap - eq",
    source:   ['{@select key="y"}',
                '{@eq value="{y}"}<div>FOO</div>{/eq}',
                '{@eq value="{x}"}<div>BAR</div>{/eq}',
              '{/select}'].join("\n"),  
    context:  { y: 'foo', x: 'bar' },
    expected: "<div>FOO</div>",
    message: "Select helper works correctly using tap for eq"
  },
  {
    name:     "select helper: using tap - gte",
    source:   "{@select key=\"foo\"}{@gte value=\"{x}\"}foobar{/gte}{/select}",
    context:  {foo : 10 , x : 10},
    expected: "foobar",
    message: "Select helper works correctly using tap for gte"
  },
  {
    name:     "select helper: using tap - lte",
    source:   "{@select key=\"foo\"}{@lte value=\"{x}\"}foobar{/lte}{/select}",
    context:  {foo : 10 , x : 10},
    expected: "foobar",
    message: "Select helper works correctly using tap for lte"
  },
  {
    name:     "select helper: using tap - gt",
    source:   "{@select key=\"foo\"}{@gt value=\"{x}\"}foobar{/gt}{/select}",
    context:  {foo : 10 , x : 5},
    expected: "foobar",
    message: "Select helper works correctly using tap for gt"
  },
  {
    name:     "select helper: using tap - lt",
    source:   "{@select key=\"foo\"}{@lt value=\"{x}\"}foobar{/lt}{/select}",
    context:  {foo : 10 , x : 15},
    expected: "foobar",
    message: "Select helper works correctly using tap for lt"
  },
  {
    name:     "select helper: using tap in the key",
    source:   "{@select key=\"{x}\"}{@eq value=10}foobar{/eq}{/select}",
    context:  {foo : 10 , x : "foo"},
    expected: "foobar",
    message: "Select helper works correctly using tap in the key"
  },
  {
    name:     "select helper: using tap in the key with nested objects",
    source:   "{@select key=\"{x.key}\"}{@eq value=10}foobar{/eq}{/select}",
    context:  {foo : 10 , x : {key : "foo"}},
    expected: "foobar",
    message: "Select helper works correctly using tap in the key with nested objects"
  },
  {
    name:     "select helper: using tap in the key with nested objects",
    source:   "{@select key=\"{x.b.foo}\"}{@eq value=10}foobar{/eq}{/select}",
    context:  { a : 10 , x : {b : { "foo" : "a"}}},
    expected: "foobar",
    message: "Select helper works correctly using tap in the key with nested objects"
  },
  {
    name:     "select helper inside an object: usign tap in the key",
    source:   ["{#b}{@select key=\"y\"}{@eq value=\"{y}\"}<div>FOO</div>{/eq}",
               "{@eq value=\"{x}\"}<div>BAR</div>{/eq}",
               "{/select}{/b}"].join("\n"),
    context:  { b : { y: "foo", x: "bar" } },
    expected: "<div>FOO</div>",
    message: "Select helper works correctly inside an object using tap in the key"
  },
  {
    name:     "select helper inside an object: usign else tag",
    source:   ["{#b}{@select key=\"y\"}{@eq value=\"{y}\"}<div>FOO</div>{/eq}",
               "{@eq value=\"{x}\"}<div>BAR</div>{/eq}",
               "{@else value=\"foo\"}foofoo{/else}",
               "{/select}{/b}"].join("\n"),
    context:  { b : { z: "foo", x: "bar" } },
    expected: "foofoo",
    message: "Select helper works correctly inside an object using else tag"
  },
  {
    name:     "select helper inside an object: usign else tag without value",
    source:   ["{#b}{@select key=\"y\"}{@eq value=\"{y}\"}<div>FOO</div>{/eq}",
               "{@eq value=\"{x}\"}<div>BAR</div>{/eq}",
               "{@else value=\"foo\"}foofoo{/else}",
               "{/select}{/b}"].join("\n"),
    context:  { b : { z: "foo", x: "bar" } },
    expected: "foofoo",
    message: "Select helper works correctly inside an object using else tag without value"
  },
  {
    name: "ws updated to allow eol",
    source: ['{#authors ',
              'name="theAuthors"',
              'lastname="authorlastname" ',
              'maxtext=300}',
              '{>"otherTemplate"/}',
              '{/authors}',].join("\n"),
    context: {},
    expected: "",
    message: "Should ignore carriage return or tab"
  },
  {
    name: "literal params relaxed to allow eol",
    source: ['{#helper name="Dialog" config="{',
            '\'name\' : \'index\' }',
            ' "} {/helper}'].join("\n"),
    context: {},
    expected: "",
  },
  {
    name: "dust grammar for dynamic inline partials",
    source: ['{<title_A}',
                'AAA',
              '{/title_A}',
              '{<title_B}',
                'BBB',
              '{/title_B}',
              '{+"title_{val}"/}'].join("\n"),
    context: { "val" : "A" },
    expected: "AAA",
    message: "inline partial should accept dynamic key"
  },
  {
    name: "dust grammar for dynamic inline partials with two keys",
    source: ['{<title_A}',
                'AAA',
              '{/title_A}',
              '{<title_B}',
                'BBB',
              '{/title_B}',
              '{+"{val1}_{val2}"/}'].join("\n"),
    context: { "val1" : "title", "val2" : "A" },
    expected: "AAA",
    message: "inline partial should accept more than one dynamic key"
  },
  {
    name: "dust grammar for dynamic inline partials with objects",
    source: ['{<title_A}',
                'AAA',
              '{/title_A}',
              '{<title_B}',
                'BBB',
              '{/title_B}',
              '{+"{val1}_{obj.name}"/}'].join("\n"),
    context: { "val1" : "title", "val2" : "A", "obj" : { "name" : "B" } },
    expected: "BBB",
    message: "inline partial should accept objects as dynamic keys"
  },
  {
    name: "dust grammar for dynamic inline partials with array",
    source: ['{<title_A}',
                'AAA',
              '{/title_A}',
              '{<title_B}',
                'BBB',
              '{/title_B}',
              '{+"{val1}_{obj.name[0]}"/}'].join("\n"),
    context: { "val1" : "title", "val2" : "A", "obj" : { "name" : ["A", "B"] } },
    expected: "AAA",
    message: "inline partial should accept array reference as dynamic keys"
  }
];

if (typeof module !== "undefined" && typeof require !== "undefined") {
    module.exports = dustExamples; // We're on node.js
} else {
    window.dustExamples = dustExamples; // We're on the browser
}
