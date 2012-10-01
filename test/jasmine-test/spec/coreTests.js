var coreTests = [
  {
    name: "syntax error",
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
                };
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
    name:     "partial_with_blocks",
    source:   "{+header}default header {/header}Hello {name}! You have {count} new messages.",
    context:  { name: "Mick", count: 30 },
    expected: "default header Hello Mick! You have 30 new messages.",
    message: "should test a partial with blocks"
  },
  {
    name:     "partial_with_blocks_and_no_defaults",
    source:   "{+header/}Hello {name}! You have {count} new messages.",
    context:  { name: "Mick", count: 30 },
    expected: "Hello Mick! You have 30 new messages.",
    message: "should test a partial with blocks and no defaults"
  },
  {
    name:     "false value in context is treated as empty, same as undefined",
    source:   "{false}",
    context:  { "false": false },
    expected: "",
    message: "should test for false in the context, evaluated and prints nothing"
  },
  {
    name:     "numeric 0 value in context is treated as non empty",
    source:   "{zero}",
    context:  { "zero": 0 },
    expected: "0",
    message: "should test for numeric zero in the context, prints the numeric zero"
  },
  {
    name:     "emptyString context is treated as empty",
    source:   "{emptyString}",
    context:  { "emptyString": "" },
    expected: "",
    message: "should test emptyString, prints nothing"
  },
  {
     name:     "emptyString, single quoted in context is treated as empty",
     source:   "{emptyString}",
     context:  { "emptyString": '' },
     expected: "",
     message: "should test emptyString single quoted, prints nothing"
  },
  {
      name:     "null in the context treated as empty",
      source:   "{NULL}",
      context:  { "NULL": null },
      expected: "",
      message: "should test null in the context treated as empty"
  },
  {
      name:     "undefined in the context treated as empty",
      source:   "{UNDEFINED}",
      context:   {"UNDEFINED": undefined },
      expected: "",
      message: "should test undefined in the context treated as empty"
  },
  {
       name:     "undefined string in the context treated as non empty",
       source:   "{UNDEFINED}",
       context:   {"UNDEFINED": "undefined"},
       expected: "undefined",
       message: "should test string undefined in the context as non empty"
  },
  {
        name:     "null is treated as empty in exists",
        source:   "{?scalar}true{:else}false{/scalar}",
        context:   {"scalar": null},
        expected: "false",
        message:  "should test null as empty in exists section"
  },
  {
        name:     "undefined is treated as empty in exists",
        source:   "{?scalar}true{:else}false{/scalar}",
        context:   {"scalar": undefined},
        expected: "false",
        message:  "should test null treated as empty in exists"
  },
  {
         name:     "null is treated as truthy in not exists",
         source:   "{^scalar}true{:else}false{/scalar}",
         context:   {"scalar": null},
         expected: "true",
         message:  "should test null as truthy in not exists"
   },
   {
           name:     "undefined is treated as truthy in not exists",
           source:   "{^scalar}true{:else}false{/scalar}",
           context:   {"scalar": undefined},
           expected: "true",
           message:  "should test undefined as truthy in not exists"
   },
   {
         name:     "undefined is treated as empty in exists",
         source:   "{?scalar}true{:else}false{/scalar}",
         context:   {"scalar": undefined},
         expected: "false",
         message:  "should test null treated as empty in exists"
   },
   {
        name:     "scalar null in a # section",
        source:   "{#scalar}true{:else}false{/scalar}",
        context:   {"scalar": null},
        expected: "false",
        message:  "should test for a scalar null in a # section"
   },
   {
         name:     "scalar numeric 0 in a # section",
         source:   "{#scalar}true{:else}false{/scalar}",
         context:   {"scalar": 0},
         expected: "true",
         message:  "should test for a scalar numeric 0 in a # section"
   },
   {
         name:     "scalar numeric non-zero in a # section",
         source:   "{#scalar}true{:else}false{/scalar}",
         context:   {"scalar": 42},
         expected: "true",
         message:  "should test for a scalar numeric non-zero in a # section"
   },
   {
         name:     "scalar non empty string in a # section",
         source:   "{#scalar}true{:else}false{/scalar}",
         context:   {"scalar": 'abcde'},
         expected: "true",
         message:  "should test for a scalar string in a # section"
   },
   {
         name:     "scalar non empty string in a # section",
         source:   "{#scalar}{.}{:else}false{/scalar}",
         context:   {"scalar": 'abcde'},
         expected: "abcde",
         message:  "should test for a scalar string in a # section"
   },
   {
          name:     "missing scalar value",
          source:   "{#scalar}true{:else}false{/scalar}",
          context:   {"foo": 0},
          expected: "false",
          message:  "should test a missing/undefined scalar value"
   },
   {
         name:     "scalar true value in the # section",
         source:   "{#scalar}true{:else}false{/scalar}",
         context:   {"scalar": true},
         expected: "true",
         message:  "shoud test for scalar true value in the # section"
   },
   {
         name:     "scalar false value in the # section",
         source:   "{#scalar}true{:else}false{/scalar}",
         context:   {"scalar": false},
         expected: "false",
         message:  "shoud test for scalar false value in the # section"
   },
   {
        name:     "empty array is treated as empty in exists",
        source:   "{?array}true{:else}false{/array}",
        context:   {"array": []},
        expected: "false",
        message:  "empty array is treated as empty in exists"
   },
   {
        name:     "empty {} is treated as non empty in exists",
        source:   "{?object}true{:else}false{/object}",
        context:  {"object": {}},
        expected: "true",
        message:  "empty {} is treated as non empty in exists"
  },
  {
        name:     "empty array is treated as empty in a section",
        source:   "{#array}true{:else}false{/array}",
        context:   {"array": []},
        expected: "false",
        message:  "empty array is treated as empty in a section"
  },
  {
        name:     "empty {} is treated as non empty in a section",
        source:   "{#object}true{:else}false{/object}",
        context:  {"object": {}},
        expected: "true",
        message:  "empty {} is treated as non empty"
  },
  {
        name:     "non-empty array in a reference",
        source:   "{array}",
        context:   {"array": ['1','2']},
        expected: "1,2",
        message: "non-empty array in a reference"
  },
  {
      name:     "null string in the context treated as non empty",
      source:   "{NULL}",
      context:   {"NULL": "null" },
      expected: "null",
      message: "should test null string in the context treated as non empty"
  },
  {
    name:     "String 0 value in context is treated as non empty",
    source:   "{zero}",
    context:   {"zero": "0" },
    expected: "0",
    message: "should test for string zero in the context, prints zero"
  },
  {
    name:     "should test one basic reference",
    source:   "{?one}{one}{/one}",
    context:   {"one": 0 },
    expected: "0",
    message: "should test one basic reference"
  },
  {
    name:     "array",
    source:   "{#names}{title} {name}{~n}{/names}",
    context:  { title: "Sir", names: [ { name: "Moe" }, { name: "Larry" }, { name: "Curly" } ] },
    expected: "Sir Moe\nSir Larry\nSir Curly\n",
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
    name:     "force_local",
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
    name:     "scalar values true and false are supported in # nor else blocks ",
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
    message:"should test scalar values true and false are supported in # nor else blocks"
  },
  {
     name:   ". creating a block and use it to set aliases",
     source: "{#. test=\"you\"}{name} {test}{/.}",
     context: { name: "me"},
     expected: "me you",
     message: ". creating a block"
   },
  {
    name:   "empty_else_block",
    source: "{#foo}full foo{:else}empty foo{/foo}",
    context: { foo: []},
    expected: "empty foo",
    message: "should test else block when array empty"
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
    message:  "should test partials"
  },
  {
    name:     "partial with context",
    source:   "{>replace:.profile/}",
    context:  { profile: { name: "Mick", count: 30 } },
    expected: "Hello Mick! You have 30 new messages.",
    message:  "should test partial with context"
  },
  {
     name:     "partial with blocks, with no default values for blocks",
     source:   '{>partial_with_blocks_and_no_defaults/}',
     context:  { name: "Mick", count: 30 },
     expected: "Hello Mick! You have 30 new messages.",
     message:  "partial with blocks, with no default values for blocks"
   },
   {
     name:     "partial with blocks, with no default values for blocks, but override default values with inline partials",
     source:   '{>partial_with_blocks_and_no_defaults/}{<header}override header {/header}',
     context:  { name: "Mick", count: 30 },
     expected: "override header Hello Mick! You have 30 new messages.",
     message:  "partial with blocks, with no default values for blocks, but override default values with inline partials"
   },
   {
     name:     "partial with blocks, override default values with inline partials",
     source:   '{>partial_with_blocks/}{<header}my header {/header}',
     context:  { name: "Mick", count: 30 },
     expected: "my header Hello Mick! You have 30 new messages.",
     message: "partial with blocks, override default values with inline partials"
  },
  {
    name:     "partial with inline params",
    source:   '{>replace name=n count="{c}"/}',
    context:  { n: "Mick", c: 30 },
    expected: "Hello Mick! You have 30 new messages.",
    message: "should test partial with inline params"
  },
  {
    name:     "partial with inline params tree walk up",
    source:   '{#a}{#b}{#c}{#d}{>replace name=n count="{x}"/}{/d}{/c}{/b}{/a}',
    context:  { n: "Mick", x: 30, a:{b:{c:{d:{e:"1"}}}} },
    expected: "Hello Mick! You have 30 new messages.",
    message: "should test partial with inline params tree walk up"
  },
  {name:     "partial with inline params and context",
    source:   '{>replace:profile name="{n}" count="{c}"/}',
    context:  { profile:  { n: "Mick", c: 30 } },
    expected: "Hello Mick! You have 30 new messages.",
    message: "should test partial with inline params and context"
  },
  {
    name:     "partial with inline params and context tree walk up",
    source:   '{#profile}{#a}{#b}{#c}{#d}{>replace:profile name=n count="{x}"/}{/d}{/c}{/b}{/a}{/profile}',
    context:  { profile:{ n: "Mick", x: 30, a:{b:{c:{d:{e:"1"}}}} } },
    expected: "Hello Mick! You have 30 new messages.",
    message: "should test partial with inline params and context tree walk up"
  },
  {name:     "partial with literal inline param and context",
    source:   '{>replace:profile name="Joe" count="99"/}',
    context:  { profile:  { n: "Mick", count: 30 } },
    expected: "Hello Joe! You have 30 new messages.",
    message: "should test partial with literal inline param and context. Fallback values for name or count are undefined"
  },
  {
    name:     "partial with blocks and inline params",
    source:   '{>partial_with_blocks name=n count="{c}"/}',
    context:  { n: "Mick", c: 30 },
    expected: "default header Hello Mick! You have 30 new messages.",
    message: "should test partial with blocks and inline params"
  },
  {
    name:     "partial with blocks, override default values for blocks and inline params",
    source:   '{>partial_with_blocks name=n count="{c}"/}{<header}my header {/header}',
    context:  { n: "Mick", c: 30 },
    expected: "my header Hello Mick! You have 30 new messages.",
    message: "should test partial with blocks, override default values for blocks and inline params"
  },
  {
    name:     "partial with blocks and no defaults, override default values for blocks and inline params",
    source:   '{>partial_with_blocks_and_no_defaults name=n count="{c}"/}{<header}my header {/header}',
    context:  { n: "Mick", c: 30 },
    expected: "my header Hello Mick! You have 30 new messages.",
    message: "should test partial blocks and no defaults, override default values for blocks and inline params"
  },
  {
     name:     "partial with no blocks, ignore the override inline partials",
     source:   '{>replace name=n count="{c}"/}{<header}my header {/header}',
     context:  { n: "Mick", c: 30 },
     expected: "Hello Mick! You have 30 new messages.",
     message: "should test partial with no blocks, ignore the override inline partials"
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
    name:     "ignore extra whitespaces between opening brace plus any of (#,?,@,^,+,%) and the tag identifier",
    source:   '{# helper foo="bar" boo="boo" } {/helper}',
    context:  { "helper": function(chunk, context, bodies, params) { return chunk.write(params.boo + " " + params.foo); } },
    expected: "boo bar",
    message: "should ignore extra whitespaces between opening brace plus any of (#,?,@,^,+,%) and the tag identifier"
  },
  {
    name:     "error: whitespaces between the opening brace and any of (#,?,@,^,+,%) is not allowed",
    source:   '{ # helper foo="bar" boo="boo" } {/helper}',
    context:  { "helper": function(chunk, context, bodies, params) { return chunk.write(params.boo + " " + params.foo); } },
    error: 'Expected buffer, comment, partial, reference, section or special but "{" found. At line : 1, column : 34',
    message: "should show an error for whitespces between the opening brace and any of (#,?,@,^,+,%)"
  },
  {
    name:     "whitespaces between the closing brace plus slash and the tag identifier is supported",
    source:   '{# helper foo="bar" boo="boo"} {/ helper }',
    context:  { "helper": function(chunk, context, bodies, params) { return chunk.write(params.boo + " " + params.foo); } },
    expected: "boo bar",
    message: "should ignore extra whitespaces between the closing brace plus slash and the tag identifier"
  },
  {
    name:     "error: whitespaces between the openning curly brace and forward slash in the closing tags not supported",
    source:   '{# helper foo="bar" boo="boo"} { / helper }',
    context:  { "helper": function(chunk, context, bodies, params) { return chunk.write(params.boo + " " + params.foo); } },
    error: 'Expected buffer, comment, partial, reference, section or special but "{" found. At line : 1, column : 1',
    message: "should show an error because whitespaces between the '{' and the forward slash are not allowed in the closing tags"
  },
  {
    name:     "whitespaces before the self closing tags is allowed",
    source:   '{#helper foo="bar" boo="boo" /}',
    context:  { "helper": function(chunk, context, bodies, params) { return chunk.write(params.boo + " " + params.foo); } },
    expected: "boo bar",
    message: "should ignore extra whitespaces before the self closing tags"
  },
  {
    name:     "error: whitespaces between the forward slash and the closing brace in self closing tags",
    source:   '{#helper foo="bar" boo="boo" / }',
    context:  { "helper": function(chunk, context, bodies, params) { return chunk.write(params.boo + " " + params.foo); } },
    error: 'Expected buffer, comment, partial, reference, section or special but "{" found. At line : 1, column : 1',
    message: "should show an error for whitespaces  etween the forward slash and the closing brace in self closing tags"
  },
  {
    name: "extra whitespaces between inline params supported",
    source: '{#helper foo="bar"   boo="boo"/}',
    context: { "helper": function(chunk, context, bodies, params) { return chunk.write(params.boo + " " + params.foo); } },
    expected: "boo bar",
    message: "should ignore extra whitespaces between inline params"
  },
  {
    name: "error : whitespaces between the '{' plus '>' and partial identifier is not supported",
    source: '{> replace/} {> "plain"/} {> "{ref}"/}',
    context: { "name": "Jim", "count": 42, "ref": "plain" },
    error: 'Expected buffer, comment, partial, reference, section or special but "{" found. At line : 1, column : 1',
    message: "should show an error for whitespaces between the '{' plus '>' and partial identifier"
  },
  {
    name: "whitespaces before the forward slash and the closing brace in partials supported",
    source: '{>replace /} {>"plain" /} {>"{ref}" /}',
    context: { "name": "Jim", "count": 42, "ref": "plain" },
    expected: "Hello Jim! You have 42 new messages. Hello World! Hello World!",
    message: "should ignore extra whitespacesbefore the forward slash and the closing brace in partials"
  },
  {
    name:     "Accessing array element by index when element value is a primitive",
    source:   '{do.re[0]}',
    context:  { "do": { "re" : ["hello!","bye!"] } },
    expected: "hello!",
    message: "should return a specific array element by index when element value is a primitive"
  },
  {
    name:     "Accessing array by index when element value is a object",
    source:   '{do.re[0].mi}',
    context:  { "do": { "re" : [{"mi" : "hello!"},"bye!"] } },
    expected: "hello!",
    message: "should return a specific array element by index when element value is a object"
  },
  {
    name:     "Accessing array by index when element is a nested object",
    source:   '{do.re[0].mi[1].fa}',
    context:  { "do": { "re" : [{"mi" : ["one", {"fa" : "hello!"}]},"bye!"] } },
    expected: "hello!",
    message: "should return a specific array element by index when element is a nested object"
  },
  {
    name:     "Accessing array by index when element is list of primitives",
    source:   '{do[0]}',
    context:  { "do": ["lala", "lele"] },
    expected: "lala",
    message: "should return a specific array element by index when element is list of primitives"
  },
  {
    name:     "Accessing array inside a loop using the current context",
    source:   '{#list3}{.[0].biz}{/list3}',
    context:  { "list3": [[ { "biz" : "123" } ], [ { "biz" : "345" } ]]},
    expected: "123345",
    message: "should return a specific array element using the current context"
  },
  {
    name:     "inline params as integer",
    source:   "{#helper foo=10 /}",
    context:  { helper: function(chunk, context, bodies, params) { return chunk.write(params.foo); } },
    expected: "10",
    message: "Block handlers syntax should support integer number parameters"
  },
  {
    name:     "inline params as float",
    source:   "{#helper foo=3.14159 /}",
    context:  { helper: function(chunk, context, bodies, params) { return chunk.write(params.foo); } },
    expected: "3.14159",
    message: "Block handlers syntax should support decimal number parameters"
  },
  {
     name:     "Invalid filter",
     source:   "{obj|nullcheck|invalid}",
     context:  { obj: "test" },
     expected: "test",
     message: "should fail gracefully for invalid filter"
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
    name: "ignore whitespaces also means ignoring eol",
    source: ['{#authors ',
              'name="theAuthors"',
              'lastname="authorlastname" ',
              'maxtext=300}',
              '{>"otherTemplate"/}',
              '{/authors}'].join("\n"),
    context: {},
    expected: "",
    message: "should ignore eol"
  },
  {
    name: "ignore carriage return or tab in inline param values",
    source: ['{#helper name="Dialog" config="{',
            '\'name\' : \'index\' }',
            ' "} {/helper}'].join("\n"),
    context: {},
    expected: "",
    message: "should ignore carriage return or tab in inline param values"
  },
  {
     name:     "array: reference $idx in iteration on objects",
     source:   "{#names}({$idx}).{title} {name}{~n}{/names}",
     context:  { title: "Sir", names: [ { name: "Moe" }, { name: "Larry" }, { name: "Curly" } ] },
     expected: "(0).Sir Moe\n(1).Sir Larry\n(2).Sir Curly\n",
     message: "array: reference $idx in iteration on objects"
  },
  {
      name:     "array: reference $len in iteration on objects",
      source:   "{#names}Size=({$len}).{title} {name}{~n}{/names}",
      context:  { title: "Sir", names: [ { name: "Moe" }, { name: "Larry" }, { name: "Curly" } ] },
      expected: "Size=(3).Sir Moe\nSize=(3).Sir Larry\nSize=(3).Sir Curly\n",
      message: "test array: reference $len in iteration on objects"
  },
  {
     name:     "array reference $idx in iteration on simple type",
     source:   "{#names}({$idx}).{title} {.}{~n}{/names}",
     context:  { title: "Sir", names: [ "Moe", "Larry", "Curly" ] },
     expected: "(0).Sir Moe\n(1).Sir Larry\n(2).Sir Curly\n",
     message: "test array reference $idx in iteration on simple types"
  },
  {
      name:     "array reference $len in iteration on simple type",
      source:   "{#names}Size=({$len}).{title} {.}{~n}{/names}",
      context:  { title: "Sir", names: [ "Moe", "Larry", "Curly" ] },
      expected: "Size=(3).Sir Moe\nSize=(3).Sir Larry\nSize=(3).Sir Curly\n",
      message: "test array reference $len in iteration on simple types"
  },
  {
      name:     "array reference $idx/$len on empty array case",
      source:   "{#names}Idx={$idx} Size=({$len}).{title} {.}{~n}{/names}",
      context:  { title: "Sir", names: [ ] },
      expected: "",
      message: "test array reference $idx/$len on empty array case"
  },
  {
      name:     "array reference $idx/$len on single element case (scalar case)",
      source:   "{#name}Idx={$idx} Size={$len} {.}{/name}",
      context:  { name: "Just one name" },
      expected: "Idx= Size= Just one name",
      message: "test array reference $idx/$len on single element case"
  },
  {
      name:     "array reference $idx/$len {#.} section case",
      source:   "{#names}{#.}{$idx}{.} {/.}{/names}",
      context:  { names:  ["Moe", "Larry", "Curly"] },
      expected: "0Moe 1Larry 2Curly ",
      message: "test array reference $idx/$len {#.} section case"
  },
  {
      name:     "array reference $idx/$len nested loops",
      source:   "{#A}A loop:{$idx}-{$len},{#B}B loop:{$idx}-{$len}C[0]={.C[0]} {/B}A loop trailing: {$idx}-{$len}{/A}",
      context:  {"A": [ {"B": [ {"C": ["Ca1", "C2"]}, {"C": ["Ca2", "Ca22"]} ] }, {"B": [ {"C": ["Cb1", "C2"]}, {"C": ["Cb2", "Ca2"]} ] } ] },
      expected: "A loop:0-2,B loop:0-2C[0]=Ca1 B loop:1-2C[0]=Ca2 A loop trailing: 0-2A loop:1-2,B loop:0-2C[0]=Cb1 B loop:1-2C[0]=Cb2 A loop trailing: 1-2",
      message: "test array reference $idx/$len nested loops"
  },
  {
    name: "blocks with dynamic keys",
    source: ['{<title_A}',
                'AAA',
              '{/title_A}',
              '{<title_B}',
                'BBB',
              '{/title_B}',
              '{+"title_{val}"/}'].join("\n"),
    context: { "val" : "A" },
    expected: "AAA",
    message: "should test blocks with dynamic keys"
  },
  {
    name: "blocks with more than one dynamic keys",
    source: ['{<title_A}',
                'AAA',
              '{/title_A}',
              '{<title_B}',
                'BBB',
              '{/title_B}',
              '{+"{val1}_{val2}"/}'].join("\n"),
    context: { "val1" : "title", "val2" : "A" },
    expected: "AAA",
    message: "should test blocks with more than one dynamic keys"
  },
  {
    name: "blocks with dynamic key values as objects",
    source: ['{<title_A}',
                'AAA',
              '{/title_A}',
              '{<title_B}',
                'BBB',
              '{/title_B}',
              '{+"{val1}_{obj.name}"/}'].join("\n"),
    context: { "val1" : "title", "val2" : "A", "obj" : { "name" : "B" } },
    expected: "BBB",
    message: "should test blocks with dynamic key values as objects"
  },
  {
    name: "blocks with dynamic key values as arrays",
    source: ['{<title_A}',
                'AAA',
              '{/title_A}',
              '{<title_B}',
                'BBB',
              '{/title_B}',
              '{+"{val1}_{obj.name[0]}"/}'].join("\n"),
    context: { "val1" : "title", "val2" : "A", "obj" : { "name" : ["A", "B"] } },
    expected: "AAA",
    message: "should test blocks with dynamic key values as arrays"
  },
  {
    name:     "test that the scope of the function is correct",
    source:   "Hello {#foo}{bar}{/foo} World!",
    context:  {
                foo: {
                  foobar: 'Foo Bar',
                  bar: function () {
                    return this.foobar;
                  }
                }
              },
    expected: "Hello Foo Bar World!",
    message: "should test scope of context function"
  },
  {
    name: "test that the scope of the function is correct and that a non-chunk return value is used for truthiness checks",
    source: "Hello {#foo}{#bar}{.}{/bar}{/foo} World!",
    context: {
               foo: {
                 foobar: 'Foo Bar',
                 bar: function () {
                   return this.foobar;
                 }
               }
             },
    expected: "Hello Foo Bar World!",
    message: "should test scope of context function"
  },
  {
    name: "test that function that do not return chunk and return falsy are treated as falsy",
    source: "{#bar}{.}{:else}false{/bar}",
    context: {
               bar: function () {
                 return false;
               }
             },
    expected: "false",
    message: "should functions that return false are falsy"
  },
  {
    name: "test that function that do not return chunk and return 0 are treated as truthy (in the Dust sense)",
    source: "{#bar}{.}{:else}false{/bar}",
    context: {
               bar: function () {
                 return 0;
               }
             },
    expected: "0",
    message: "should functions that return 0 are truthy"
  },
  {
    name: "Use dash in key",
    source: 'Hello {first-name}, {last-name}! You have {count} new messages.',
    context: { "first-name": "Mick", "last-name" : "Jagger", "count": 30 },
    expected: "Hello Mick, Jagger! You have 30 new messages.",
    message: "using dash should be allowed in keys"
  },
  {
    name: "Use dash in partial's key",
    source: '{<title-a}foo-bar{/title-a}{+"{foo-title}-{bar-letter}"/}',
    context: { "foo-title" : "title", "bar-letter": "a" },
    expected: "foo-bar",
    message: "using dash should be allowed in partial's keys"
  },
  {
    name: "Use dash in partial's params",
    source: '{>replace name=first-name count="{c}"/}',
    context: { "first-name": "Mick", "c": 30 },
    expected: "Hello Mick! You have 30 new messages.",
    message: "using dash should be allowed in partial's params"
  },
  {
    name: "Use dash in loop",
    source:   "{#first-names}{name}{/first-names}",
    context:  { "first-names": [ { name: "Moe" }, { name: "Larry" }, { name: "Curly" } ] },
    expected: "MoeLarryCurly",
    message: "should test an array using dash in key"
  },
  {
    name:     "Use dash with conditional",
    source:   "{?tags-a}tag found!{:else}No Tags!{/tags-a}" ,
    context:  { "tags-a": "tag" },
    expected: "tag found!",
    message: "should test dash in conditional tags"
  },
  { name:     "base_template with dash",
    source:   "Start{~n}\n"       +
              "{+title-t}\n"        +
              "  Template Title\n"    +
              "{/title-t}\n"        +
              "{~n}\n"            +
              "{+main-t}\n"         +
              "  Template Content\n"  +
              "{/main-t}\n"         +
              "{~n}\n"            +
              "End",
    context:  {},
    expected: "Start\nTemplate Title\nTemplate Content\nEnd",
    message: "should test base template with dash"
  },
  {
    name:     "child_template with dash",
    source:   "{^xhr-n}tag not found!{:else}tag found!{/xhr-n}",
    context:  {"xhr": false},
    expected: "tag not found!",
    message: "should test child template with dash"
  }
];

if (typeof module !== "undefined" && typeof require !== "undefined") {
    module.exports = coreTests; // We're on node.js
} else {
    window.coreTests = coreTests; // We're on the browser
}
