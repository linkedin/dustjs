(function (root, factory) {
  if (typeof exports === 'object') {
    var dust = require('../../'),
        ayepromise = require('ayepromise'),
        highland = require('highland');
    module.exports = factory(dust, ayepromise, highland);
  } else {
    root.coreTests = factory(root.dust, root.ayepromise, root.highland);
  }
}(this, function(dust, ayepromise, highland) {
/**
 * A naive Promise constructor that simply resolves or rejects its Promise based on what's passed
 * @param err {*} Invokes the `error` callback with this value
 * @param data {*} Invokes the `success` callback with this value, if `err` is not set
 * @return {Object} a fake Promise with a `then` method
 */
function FalsePromise(err, data) {
  var defer = ayepromise.defer();
  if (err) {
	defer.reject(new Error(err));
  } else {
	defer.resolve(data);
  }
  return defer.promise;
}

/**
 * A naive Stream constructor that streams the provided array asynchronously
 * @param arr {Array<Object|Error>|String} items to be streamed
 * @return {Stream}
 */
function DreamStream(arr) {
  if (typeof arr === 'string') {
    arr = arr.split('');
  }
  return function() {
    return highland(function(push) {
      arr.forEach(function(item) {
        if(item instanceof Error) {
          push(item);
        } else {
          push(null, item);
        }
      });
      push(null, highland.nil);
    });
  }
}

return [
/**
 * CORE TESTS
 */
  {
    name: "core tests",
    tests: [
      {
        name:     "streaming render",
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
        message: "should test the stream rendering"
      },
      {
        name:     "hello_world",
        source:   "Hello World!",
        context:  {},
        expected: "Hello World!",
        message: "should test basic text rendering"
      },
      {
        name:     "confusing \" \n \' \u2028 \u2029 template name\\",
        source:   "Hello World!",
        context:  {},
        expected: "Hello World!",
        message:  "javascript-special characters in template names shouldn't break things"
      },
      {
        name:     "global_template",
        source:   '{#helper foo="bar" boo="boo"} {/helper}',
        context:  { "helper": function(chunk, context, bodies, params) {
                      var currentTemplateName = context.getTemplateName();
                      return chunk.write(currentTemplateName);
                     }
                  },
        expected: "global_template",
        message: "should render the template name"
       },
       {
         name:     "apps/test/foo.tl&v=0.1",
         source:   '{#helper foo="bar" boo="boo" template="tl/apps/test"} {/helper}',
         context:  { "helper": function(chunk, context, bodies, params)
                    {
                      // top of the current stack
                      currentTemplateName = context.getTemplateName();
                      return chunk.write(currentTemplateName);
                    }
                   },
        expected: "apps/test/foo.tl&v=0.1",
        message: "should render the template name with paths"
      },
      {
         name:     "makeBase_missing_global",
         source:   '{#helper}{/helper}',
         context:  { "helper": function(chunk, context, bodies, params)
                    {
                      var newContext = {};
                      return bodies.block(chunk, dust.makeBase(newContext));
                    }
                   },
        expected: "",
        message: "should render the helper with missing global context"
      },
      {
        name:     "reference",
        source:   "{?one}{one}{/one}",
        context:   {"one": 0 },
        expected: "0",
        message: "should test a basic reference"
      },
      {
        name:     "implicit array",
        source:   "{#names}{.}{~n}{/names}",
        context:  { names: ["Moe", "Larry", "Curly"] },
        expected: "Moe\nLarry\nCurly\n",
        message: "should test an implicit array"
      },
      {
        name:     "inline param from outer scope",
        source:   "{#person foo=root}{foo}: {name}, {age}{/person}",
        context:  { root: "Subject", person: { name: "Larry", age: 45 } },
        expected: "Subject: Larry, 45",
        message: "should test renaming a key"
      },
      {
        name:     "force local",
        source:   "{#person}{.root}: {name}, {age}{/person}",
        context:  { root: "Subject", person: { name: "Larry", age: 45 } },
        expected: ": Larry, 45",
        message: "should test force a key"
      },
      {
        name:     "filter un-escape",
        source:   "{safe|s}{~n}{unsafe}",
        context:  { safe: "<script>alert('Hello!')</script>", unsafe: "<script>alert('Goodbye!')</script>" },
        expected: "<script>alert('Hello!')</script>\n&lt;script&gt;alert(&#39;Goodbye!&#39;)&lt;/script&gt;",
        message: "should test escaped characters"
      },
      {
        name:     "escape pragma",
        source:   "{%esc:s}\n  {unsafe}{~n}\n  {%esc:h}\n    {unsafe}\n  {/esc}\n{/esc}",
        context:  { unsafe: "<script>alert('Goodbye!')</script>" },
        expected: "<script>alert('Goodbye!')</script>\n&lt;script&gt;alert(&#39;Goodbye!&#39;)&lt;/script&gt;",
        message: "should test escape_pragma"
      },
      {
         name:   "use . for creating a block and set params",
         source: "{#. test=\"you\"}{name} {test}{/.}",
         context: { name: "me"},
         expected: "me you",
         message: ". creating a block"
      },
      {
        name:     "functions in context",
        source:   "Hello {type} World!",
        context:  {
                    type: function(chunk) {
                      return "Sync";
                    }
                  },
        expected: "Hello Sync World!",
        message: "should functions in context"
      },
      {
        name:     "async functions in context",
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
        message: "should test functions in context"
      },
      {
        name:     "sync chunk write test",
        source:   "Hello {type} World!",
        context:  {
                    type: function(chunk) {
                      return chunk.write("Chunky");
                    }
                  },
        expected: "Hello Chunky World!",
        message: "should test sync chunk write"
      },
      {
        name:     "base_template",
        source:   "Start{~n}"       +
                  "{+title}"        +
                  "Base Title"    +
                  "{/title}"        +
                  "{~n}"            +
                  "{+main}"         +
                  "Base Content"  +
                  "{/main}"         +
                  "{~n}"            +
                  "End",
        context:  {},
        expected: "Start\nBase Title\nBase Content\nEnd",
        message: "should test base template"
      },
      {
        name:     "child_template",
        source:   "{^xhr}"              +
                  "{>base_template/}" +
                  "{:else}"             +
                  "{+main/}"          +
                  "{/xhr}"              +
                  "{<title}"            +
                  "Child Title"       +
                  "{/title}"            +
                  "{<main}"             +
                  "Child Content"     +
                  "{/main}",
        context:  {xhr: false},
        expected: "Start\nChild Title\nChild Content\nEnd",
        message: "should test child template"
      },
      {
        name:     "issue322",
        source:   'hi{+"{name}"/}',
        context:  {},
        expected: "hi",
        message: "should setup base template for next test. hi should not be part of base block name"

      },
      {
        name:     "issue322 use base template picks up prefix chunk data",
        source:   '{>issue322 name="abc"/}' +
		   "{<abc}ABC{/abc}",
        context:  {},
        expected: "hiABC",
        message: "should use base template and honor name passed in"

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
		name: "context.resolve",
		source: ['{#foo',
             'bar="{baz} is baz "',
             'literal="literal "',
             'func=func',
             'chunkFunc="{chunkFunc}"',
             'indirectChunkFunc=indirectChunkFunc',
             'ref=ref',
             '}Fail{/foo}'].join(' '),
		context: {
		  foo: function(chunk, context, bodies, params) {
  			chunk.write(context.resolve(params.bar));
  			chunk.write(context.resolve(params.literal));
  			chunk.write(context.resolve(params.func));
        chunk.write(context.resolve(params.chunkFunc));
        chunk.write(context.resolve(params.indirectChunkFunc));
  			chunk.write(context.resolve(params.ref));
  			return chunk;
		  },
		  baz: "baz",
		  ref: "ref",
		  func: function() {
			  return "func ";
		  },
		  chunkFunc: function(chunk) {
			  return chunk.write('chunk ');
		  },
      indirectChunkFunc: function(chunk) {
        return chunk.write('indirect ');
      }
		},
		expected: "baz is baz literal func chunk indirect ref",
		message: "context.resolve() taps parameters from the context"
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
        name: "context push / pop",
        source: "{#helper}{greeting} {firstName} {lastName}{.}{/helper}",
        context: {"helper": function(chunk, context, bodies) {
          var ctx = dust.makeBase({ greeting: "Hello" })
                        .push({ firstName: "Dusty" })
                        .push({ lastName: "Dusterson" })
                        .push("!")
                        .push(".");
          ctx.pop();
          return chunk.render(bodies.block, ctx);
        }},
        expected: "Hello Dusty Dusterson!",
        message: "should allow pushing and popping a context"
      },
      {
        name: "context clone",
        source: "{#helper}{greeting} {firstName} {lastName}{/helper}",
        context: {"helper": function(chunk, context, bodies) {
          var ctx = dust.makeBase({ greeting: "Hello" })
                        .push({ firstName: "Dusty" })
                        .push({ lastName: "Dusterson" })
                        .clone();
          return chunk.render(bodies.block, ctx);
        }},
        expected: "Hello Dusty Dusterson",
        message: "should allow cloning a context"
      }
    ]
  },
/**
 * TRUTH/FALSY TESTS
 */
  {
    name: "truth/falsy tests",
    tests: [
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
        name:     "empty string context is treated as empty",
        source:   "{emptyString}",
        context:  { "emptyString": "" },
        expected: "",
        message: "should test emptyString, prints nothing"
      },
      {
        name:     "empty string, single quoted in context is treated as empty",
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
       }
    ]
  },
/**
 * SCALAR DATA TESTS
 */
  {
    name: "scalar data tests",
    tests: [
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
        name:     "scalar values true and false are supported in # nor else blocks ",
        source:   "{#foo}"         +
                  "foo,{~s}"     +
                  "{:else}"        +
                  "not foo,{~s}" +
                  "{/foo}"         +
                  "{#bar}"         +
                  "bar!"         +
                  "{:else}"        +
                  "not bar!"     +
                  "{/bar}",
        context:  { foo: true, bar: false },
        expected: "foo, not bar!",
        message:"should test scalar values true and false are supported in # nor else blocks"
      }
    ]
  },
/**
 * EMPTY DATA TESTS
 */
  {
    name: "empty data tests",
    tests: [
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
        name:     "string 0 value in context is treated as non empty",
        source:   "{zero}",
        context:   {"zero": "0" },
        expected: "0",
        message: "should test for string zero in the context, prints zero"
      },
      {
        name:     "empty array",
        source:   "{#names}{title} {name}{~n}{/names}",
        context:  { title: "Sir", names: [] },
        expected: "",
        message: "should test an empty array"
      },
      {
        name:     "empty params in helper",
        source:   "{#emptyParamHelper}{/emptyParamHelper}",
        context:  { "emptyParamHelper" : function(chunk, context, bodies, params) {
                      return chunk.write(params.foo);
                    }
                  },
        expected: "",
        message: "should output nothing, but no error should fire"
      }
    ]
  },
/**
 * ARRAY/INDEX ACCESS TESTS
 */
  {
    name: "array/index-access tests",
    tests: [
      {
        name:     "array",
        source:   "{#names}{title} {name}{~n}{/names}",
        context:  { title: "Sir", names: [ { name: "Moe" }, { name: "Larry" }, { name: "Curly" } ] },
        expected: "Sir Moe\nSir Larry\nSir Curly\n",
        message: "should test an array"
      },
      {
        name:     "accessing array element by index when element value is a primitive",
        source:   '{do.re[0]}',
        context:  { "do": { "re" : ["hello!","bye!"] } },
        expected: "hello!",
        message: "should return a specific array element by index when element value is a primitive"
      },
      {
        name:     "accessing array by index when element value is a object",
        source:   '{do.re[0].mi}',
        context:  { "do": { "re" : [{"mi" : "hello!"},"bye!"] } },
        expected: "hello!",
        message: "should return a specific array element by index when element value is a object"
      },
      {
        name:     "accessing array by index when element is a nested object",
        source:   '{do.re[0].mi[1].fa}',
        context:  { "do": { "re" : [{"mi" : ["one", {"fa" : "hello!"}]},"bye!"] } },
        expected: "hello!",
        message: "should return a specific array element by index when element is a nested object"
      },
      {
        name:     "accessing array by index when element is list of primitives",
        source:   '{do[0]}',
        context:  { "do": ["lala", "lele"] },
        expected: "lala",
        message: "should return a specific array element by index when element is list of primitives"
      },
      {
        name:     "accessing array inside a loop using the current context",
        source:   '{#list3}{.[0].biz}{/list3}',
        context:  { "list3": [[ { "biz" : "123" } ], [ { "biz" : "345" } ]]},
        expected: "123345",
        message: "should return a specific array element using the current context"
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
        name: "array reference $len in iteration on simple type",
        source: "{#names}Size=({$len}).{title} {.}{~n}{/names}",
        context:  { title: "Sir", names: [ "Moe", "Larry", "Curly" ] },
        expected: "Size=(3).Sir Moe\nSize=(3).Sir Larry\nSize=(3).Sir Curly\n",
        message: "test array reference $len in iteration on simple types"
      },
      {
        name: "array reference $idx/$len on empty array case",
        source: "{#names}Idx={$idx} Size=({$len}).{title} {.}{~n}{/names}",
        context:  { title: "Sir", names: [ ] },
        expected: "",
        message: "test array reference $idx/$len on empty array case"
      },
      {
        name: "array reference $idx/$len on single element case (scalar case)",
        source: "{#name}Idx={$idx} Size={$len} {.}{/name}",
        context:  { name: "Just one name" },
        expected: "Idx= Size= Just one name",
        message: "test array reference $idx/$len on single element case"
      },
      {
        name: "array reference $idx/$len {#.} section case",
        source: "{#names}{#.}{$idx}{.} {/.}{/names}",
        context:  { names:  ["Moe", "Larry", "Curly"] },
        expected: "0Moe 1Larry 2Curly ",
        message: "test array reference $idx/$len {#.} section case"
      },
      {
        name: "array reference $idx/$len not changed in nested object",
        source: "{#results}{#info}{$idx}{name}-{$len} {/info}{/results}",
        context:  {results: [{info: {name: "Steven"}},{info: {name: "Richard"}}]},
        expected: "0Steven-2 1Richard-2 ",
        message: "test array reference $idx/$len not changed in nested object"
      },
      {
        name: "array reference $idx/$len nested loops",
        source: "{#A}A loop:{$idx}-{$len},{#B}B loop:{$idx}-{$len}C[0]={.C[0]} {/B}A loop trailing: {$idx}-{$len}{/A}",
        context:  {"A": [ {"B": [ {"C": ["Ca1", "C2"]}, {"C": ["Ca2", "Ca22"]} ] }, {"B": [ {"C": ["Cb1", "C2"]}, {"C": ["Cb2", "Ca2"]} ] } ] },
        expected: "A loop:0-2,B loop:0-2C[0]=Ca1 B loop:1-2C[0]=Ca2 A loop trailing: 0-2A loop:1-2,B loop:0-2C[0]=Cb1 B loop:1-2C[0]=Cb2 A loop trailing: 1-2",
        message: "test array reference $idx/$len nested loops"
      },
      {
        name: "using idx in array reference Accessing",
        source: "{#list4} {name} {number[$idx]} {$idx}{/list4}",
        context: { list4: [ {name:"Dog", number: [1,2,3]}, {name:"Cat", number: [4,5,6]}] },
        expected: " Dog 1 0 Cat 5 1",
        message: "should test the array reference access with idx"
      },
      {
        name: "using len in array reference Accessing",
        source: "{#list4} {name} {number[$len]}{/list4}",
        context: { list4: [ {name:"Dog", number: [1,2,3]}, {name:"Cat", number: [4,5,6]}] },
        expected: " Dog 3 Cat 6",
        message: "should test the array reference access with len"
      },
      {
        name: "using idx in array reference Accessing",
        source: "{#list3}{.[$idx].biz}{/list3}",
        context: { "list3": [[ { "biz" : "123" } ], [ { "biz" : "345" }, { "biz" : "456" } ]]},
        expected: "123456",
        message: "should test the array reference access with idx and current context"
      },
      {
        name: "using len in array reference Accessing",
        source: "{#list3}{.[$len].idx}{/list3}",
        context: { "list3": [
                    [{"idx": "0"},
                     {"idx": "1"},
                     {"idx": "2"}],
                    [{"idx": "0"},
                     {"idx": "1"},
                     {"idx": "2"}]
                    ]
        },
        expected: "22",
        message: "should test the array reference access with len and current context"
      },
      {
        name: "using idx in double nested array",
        source: "{#test}{#.}{.}i:{$idx}l:{$len},{/.}{/test}",
        context: { "test": [[ 1,2,3 ]]},
        expected: "1i:0l:3,2i:1l:3,3i:2l:3,",
        message: "should test double nested array and . reference: issue #340"
      },
      {
	name: "using a nested key as a reference for array index access",
	source: "{#loop.array[key.foo].sub}{.}{/loop.array[key.foo].sub}",
	context: {
		  "loop": {
		   "array": {"thing": {sub: 1, sap: 2}, "thing2": "bar"}
		  },
		  "key": { "foo": "thing" }
		 },
	expected: "1",
	message: "should test using a multilevel reference as a key in array access"
      },
      {
	name: "Outputting an array calls toString and HTML-encodes",
	source: "{array}",
	context: { "array": ["You & I", " & Moe"] },
	expected: "You &amp; I, &amp; Moe",
	message: "should HTML-encode stringified arrays referenced directly"
      }
    ]
  },
/**
 * OBJECT TESTS
 */
  {
    name: "object tests",
    tests: [
      {
        name:     "object",
        source:   "{#person}{root}: {name}, {age}{/person}",
        context:  { root: "Subject", person: { name: "Larry", age: 45 } },
        expected: "Subject: Larry, 45",
        message: "should test an object"
      },
      {
        name:     "path",
        source:   "{foo.bar}",
        context:  { foo: {bar: "Hello!"} },
        expected: "Hello!",
        message: "should test an object path"
      },
	  {
		name:     "thenable reference",
		source:   "Eventually {magic}!",
		context:  { "magic": new FalsePromise(null, "magic") },
		expected: "Eventually magic!",
		message: "should reserve an async chunk for a thenable reference"
	  },
    {
    name:     "thenable escape reference",
    source:   "{rice-krispies} {rice-krispies|s}",
    context:  { "rice-krispies": new FalsePromise(null, "Snap, Crackle & Pop") },
    expected: "Snap, Crackle &amp; Pop Snap, Crackle & Pop"
    },
	  {
		name:     "thenable deep reference",
		source:   "Eventually {magic.ally.delicious}!",
		context:  { "magic": new FalsePromise(null, {"ally": {"delicious": "Lucky Charms"} }) },
		expected: "Eventually Lucky Charms!",
		message: "should deep-inspect a thenable reference"
	  },
	  {
		name:     "thenable deep reference that doesn't exist",
		source:   "Eventually {magic.ally.disappeared}!",
		context:  { "magic": new FalsePromise(null, {"ally": {"delicious": "Lucky Charms"} }) },
		expected: "Eventually !",
		message: "should deep-inspect a thenable reference but move on if it isn't there"
	  },
	  {
		name:     "thenable deep reference... this is just getting silly",
		source:   "Eventually {magic.ally.delicious}!",
		context:  { "magic": new FalsePromise(null, {"ally": {"delicious": new FalsePromise(null, "Lucky Charms")} }) },
		expected: "Eventually Lucky Charms!",
		message: "should deep-inspect a thenable reference recursively"
	  },
	  {
		name:     "thenable reference that fails",
		source:   "Eventually {magic.ally.delicious}!",
		context:  { "magic": new FalsePromise("cereal gone") },
		expected: "Eventually !",
		message: "should inspect a thenable reference but move on if it fails",
    log:      "Unhandled promise rejection in `thenable reference that fails`"
	  },
	  {
		name:     "thenable deep reference that fails",
		source:   "Eventually {magic.ally.delicious}!",
		context:  { "magic": new FalsePromise(null, {"ally": {"delicious": new FalsePromise("cereal gone")} }) },
		expected: "Eventually !",
		message: "should deep-inspect a thenable reference but move on if it fails"
	  },
	  {
		name:     "thenable section",
		source:   "{#promise}Eventually {magic}!{/promise}",
		context:  { "promise": new FalsePromise(null, {"magic": "magic"}) },
		expected: "Eventually magic!",
		message: "should reserve an async section for a thenable"
	  },
    {
      name:   "thenable resolves with array into reference",
      source: "{promise}",
      context: { "promise": new FalsePromise(null, ['foo', 'bar', 'baz'])},
      expected: 'foo,bar,baz',
      message: "should iterate over an array resolved from a thenable"
    },
    {
      name:   "thenable resolves with array into section",
      source: "{#promise}{name}{/promise}",
      context: { "promise": new FalsePromise(null, [{name: 'foo'}, {name: 'bar'}, {name: 'baz'}])},
      expected: 'foobarbaz',
      message: "should iterate over an array resolved from a thenable"
    },
    {
		name:     "thenable empty section",
		source:   "{#promise/}",
		context:  { "promise": new FalsePromise(null, "magic") },
		expected: "",
		message: "Should not render a thenable section with no body"
	  },
	  {
		name:     "thenable section from function",
		source:   "{#promise}Eventually {magic}!{/promise}",
		context:  { "promise": function() { return new FalsePromise(null, {"magic": "magic"}); } },
		expected: "Eventually magic!",
		message: "should reserve an async section for a thenable returned from a function"
	  },
	  {
		name:     "thenable deep section",
		source:   "Eventually my {#magic.ally}{delicious}{/magic.ally} will come",
		context:  { "magic": new FalsePromise(null, {"ally": {"delicious": new FalsePromise(null, "Lucky Charms")} }) },
		expected: "Eventually my Lucky Charms will come",
		message: "should reserve an async section for a deep-reference thenable"
	  },
	  {
		name:     "thenable deep section, traverse outside",
		source:   "Eventually my {#magic.ally}{prince} {delicious} {charms}{/magic.ally} will come",
		base:     { charms: new FalsePromise(null, "Charms") },
		context:  { "prince": "Prince", "magic": new FalsePromise(null, {"ally": {"delicious": new FalsePromise(null, "Lucky")} }) },
		expected: "Eventually my Prince Lucky Charms will come",
		message: "should reserve an async section for a deep-reference thenable and not blow the stack"
	  },
	  {
		name:     "thenable resolved by global helper",
		source:   '{@promise resolve="helper"}I am a big {.}!{/promise}',
		context:  {},
		expected: "I am a big helper!",
		message:  "Dust helpers that return thenables are resolved in context"
	  },
	  {
		name:     "thenable rejected by global helper",
		source:   '{@promise reject="error"}I am a big helper!{:error}I am a big {.}!{/promise}',
		context:  {},
		expected: "I am a big error!",
		message:  "Dust helpers that return thenables are rejected in context"
	  },
	  {
		name:     "thenable error",
		source:   "{promise}",
		context:  { "promise": new FalsePromise("promise error") },
		log: "Unhandled promise rejection in `thenable error`",
		message: "rejected thenable reference logs"
	  },
	  {
		name:     "thenable error with error block",
		source:   "{#promise}No magic{:error}{message}{/promise}",
		context:  { "promise": new FalsePromise("promise error") },
		expected: "promise error",
		message: "rejected thenable renders error block"
    },
      {
        name:     "stream",
        source:   "Stream of {stream}...",
        context:  { "stream": new DreamStream("consciousness") },
        expected: "Stream of consciousness...",
        message:  "should reserve an async chunk for a stream reference"
      },
      {
        name:     "stream escaping",
        source:   "{polluted|s} {polluted}",
        context:  { "polluted": new DreamStream("<&>") },
        expected: "<&> &lt;&amp;&gt;",
        message:  "should respect filters set on stream references"
      },
      {
        name:     "stream error",
        source:   "{stream}...",
        context:  { "stream": new DreamStream(["Everything ", "is", new Error("horrible"), " awesome!"])},
        expected: "Everything is...",
        message:  "should abort the stream if it raises an error",
        log:      "Unhandled stream error in `stream error`"
      },
      {
        name:     "stream section",
        source:   "Pour {#molecule}{atom}{num}{/molecule} in the glass",
        context:  { "molecule": new DreamStream([
          {atom: "H", num: 2},
          {atom: "O"}
        ])},
        expected: "Pour H2O in the glass",
        message:  "should reserve an async section for a stream"
      },
      {
        name:     "stream section error",
        source:   "Pour {#molecule}{atom}{num}{:error}{message}{/molecule} in the glass",
        context:  { "molecule": new DreamStream([
          {atom: "H", num: 2},
          new Error("O... no!"),
          {atom: "S"},
          {atom: "O", num: 4}
        ])},
        expected: "Pour H2O... no! in the glass",
        message:  "should reserve an async chunk for a stream reference and abort if the stream errors"
      },
      {
        name: "array of streams",
        source: "{#streams}{.} {/streams}",
        context: {
          streams: [
            new DreamStream('Danube'),
            new DreamStream('Rhine'),
            new DreamStream('Seine')
          ]
        },
        expected: "Danube Rhine Seine ",
        message: "should render streams found while iterating over an array"
      },
      {
        disabled_in_rhino: "Rhino can't handle this nested asynchronisity.",
        name:     "promise a stream and stream a promise",
        source:   ["Little Bobby drank and drank, ",
                   "and then he drank some more. ",
                   "But what he thought was {water} was {sulfuric_acid}!"].join(''),
        context:  {
          "water": new FalsePromise(null, new DreamStream(["H","2","O"])),
          "sulfuric_acid": new DreamStream([new FalsePromise(null, "H2"), "SO4"])
        },
        expected: ["Little Bobby drank and drank, ",
                   "and then he drank some more. ",
                   "But what he thought was H2O was H2SO4!"].join(''),
        message:  "should seamlessly mix asynchronous data sources"
      },
      {
        name: 'MongoDB-like Document is not a stream',
        source: "{#mongo}{name}{/mongo}",
        context: {
          mongo: {
            on: function() { throw new Error("Fooled you; I am not a stream!"); },
            name: "Mongo"
          }
        },
        expected: "Mongo",
        message: "should not treat MongoDB documents as streams"
      },
      {
        name: 'Stream section with no body should not render',
        source: "{#stream/}",
        context: {
          stream: new DreamStream("hello")
        },
        expected: "",
        message: "stream section with no body should not render"
      }
    ]
  },
/**
 * CONDITIONAL TESTS
 */
  {
    name: "conditional tests",
    tests: [
      {
        name:     "conditional",
        source:   "{?tags}"                     +
                  "<ul>{~n}"                  +
                  "{#tags}"                 +
                  "{~s} <li>{.}</li>{~n}" +
                  "{/tags}"                 +
                  "</ul>"                     +
                  "{:else}"                     +
                  "No Tags!"                  +
                  "{/tags}"                     +
                  "{~n}"                        +
                  "{^likes}"                    +
                  "No Likes!"                 +
                  "{:else}"                     +
                  "<ul>{~n}"                  +
                  "{#likes}"                +
                  "{~s} <li>{.}</li>{~n}" +
                  "{/likes}"                +
                  "</ul>"                     +
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
        name:   "empty else block",
        source: "{#foo}full foo{:else}empty foo{/foo}",
        context: { foo: []},
        expected: "empty foo",
        message: "should test else block when array empty"
      }
    ]
  },
/**
 * NESTED PATH TESTS
 */
  {
    name: "nested path tests",
    tests: [
       {
        name: "Verify local mode leading dot path in local mode",
        source: "{#people}{.name} is {?.age}{.age} years old.{:else}not telling us their age.{/age}{/people}",
        context:  {
             "name": "List of people",
             "age": "8 hours",
             "people": [
               { "name": "Alice" },
               { "name": "Bob", "age": 42 }
              ]
           },
        expected: "Alice is not telling us their age.Bob is 42 years old.",
        message: "should test the leading dot behavior in local mode"
      },
     {
        name: "Standard dotted path with falsey value. Issue 317",
        source: "{foo.bar}",
        context: { foo: {bar: 0} },
        expected: "0",
        message: "should work when value at end of path is falsey"
     },
     {
        name: "dotted path resolution up context",
        source: "{#data.A.list}Aname{data.A.name}{/data.A.list}",
        context: { "data":{"A":{"name":"Al","list":[{"name": "Joe"},{"name": "Mary"}],"B":{"name":"Bob","Blist":["BB1","BB2"]}}} },
        expected: "AnameAlAnameAl",
        message: "should test usage of dotted path resolution up context"
     },
     {
        name: "dotted path resolution up context 2",
        source: "{#data.A.B.Blist}Aname{data.A.name}{/data.A.B.Blist}",
        context: { "data":{"A":{"name":"Al","list":[{"name": "Joe"},{"name": "Mary"}],"B":{"name":"Bob","Blist":["BB1","BB2"]}}} },
        expected: "AnameAlAnameAl",
        message: "should test usage of dotted path resolution up context"
      },
      {
        name: "dotted path resolution without explicit context",
        source: "{#data.A}Aname{name}{data.C.name}{/data.A}",
        context: { "data":{"A":{"name":"Al","list":[{"name": "Joe"},{"name": "Mary"}],"B":{"name":"Bob","Blist":["BB1","BB2"]}},C:{name:"cname"}} },
        expected: "AnameAlcname",
        message: "should test usage of dotted path resolution up context"
      },
      {
        name: "same as previous test but with explicit context",
        source: "{#data.A:B}Aname{name}{data.C.name}{/data.A}",
        context: { "data":{"A":{"name":"Al","list":[{"name": "Joe"},{"name": "Mary"}],"B":{"name":"Bob","Blist":["BB1","BB2"]}},C:{name:"cname"}} },
        expected: "AnameAl",
        message: "should test explicit context blocks looking further up stack"
      },
      {
        name: "explicit context but gets value from global",
        source: "{#data.A:B}Aname{name}{glob.globChild}{/data.A}",
        base: { glob: { globChild: "testGlobal"} },
        context: { "data":{"A":{"name":"Al","list":[{"name": "Joe"},{"name": "Mary"}],"B":{"name":"Bob","Blist":["BB1","BB2"]}},C:{name:"cname"}} },
        expected: "AnameAltestGlobal",
        message: "should test access global despite explicit context"
      },
      {
        name: "nested dotted path resolution",
        source: "{#data.A.list}{#data.A.B.Blist}{.}Aname{data.A.name}{/data.A.B.Blist}{/data.A.list}",
        context: { "data":{"A":{"name":"Al","list":[{"name": "Joe"},{"name": "Mary"}],"B":{"name":"Bob","Blist":["BB1"]}}} },
        expected: "BB1AnameAlBB1AnameAl",
        message: "should test nested usage of dotted path resolution"
      },
      {
        name: "check nested ref in global works in global mode",
        source: "{glob.globChild}",
        base: { glob: { globChild: "testGlobal"} },
        context: { },
        expected: "testGlobal",
        message: "Should find glob.globChild which is in context.global"
      },
      {
          name: "dotted path resolution up context with partial match in current context",
          source: "{#data}{#A}{C.name}{/A}{/data}",
          context: { "data":{ "A":{ "name":"Al", "B": "Ben", "C": { namex: "Charlie"} }, C: {name: "Charlie Sr."} } },
          expected: "",
          message: "should test usage of dotted path resolution up context"
       },
       {
        name: "check nested ref not found in global if partial match",
        source: "{#data}{#A}{C.name}{/A}{/data}",
        base: { C: {name: "Big Charlie"} },
        context: { "data":{ "A":{ "name":"Al", "B": "Ben", "C": { namex: "Charlie"} }, C: {namey: "Charlie Sr."} } },
        expected: "",
        message: "Should find glob.globChild which is in context.global"
      },
      {
        name:     "method invocation",
        source:   "Hello {person.fullName}",
        context:  {
          person: {
            firstName: "Peter",
            lastName:  "Jones",
            fullName: function() {
                return this.firstName + ' ' + this.lastName;
            }
          }
        },
        expected: "Hello Peter Jones",
        message:  "should test resolve correct 'this' when invoking method"
      },
      {
        name: "check null values in section iteration don't break path resolution",
        source: "{#nulls}{names[0].name}{/nulls}",
        context: { "nulls": [1, null, null, 2],"names": [{"name": "Moe"}, {"name": "Curly"}] },
        expected: "MoeMoeMoeMoe",
        message: "Should resolve path correctly"
      },
      {
        name: "check falsey value in section iteration don't break path resolution",
        source: "{#list}{a.b}{/list}",
        context: { "list": ['', 2, ''],"a": {"b": "B"} },
        expected: "BBB",
        message: "Should resolve path correctly"
      },
      {
        name: "check true value in section iteration are also OK",
        source: "{#list}{a.b}{/list}",
        context: { "list": [true, 2, true],"a": {"b": "B"} },
        expected: "BBB",
        message: "Should resolve path correctly"
      }
    ]
  },
/**
 * FILTER TESTS
 */
  {
    name: "filter tests",
    tests: [
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
        name:     "escapeJs filter without DQ",
        source:   "{obj|j|s}",
        context:  { obj: "<script>\\testBS\\ \rtestCR\r \u2028testLS\u2028 \u2029testPS\u2029 \ntestNL\n \ftestLF\f 'testSQ' \ttestTB\t /testFS/</script>" },
        expected: "<script>\\\\testBS\\\\ \\rtestCR\\r \\u2028testLS\\u2028 \\u2029testPS\\u2029 \\ntestNL\\n \\ftestLF\\f \\'testSQ\\' \\ttestTB\\t \\/testFS\\/<\\/script>",
        message: "should escapeJs a string when using the j filter"
      },
      {
        name:     "escapeJs filter with only DQ",
        source:   "{obj|j|s}",
        context:  { obj: '"testDQ"' },
        expected: '\\"testDQ\\"',
        message: "should escapeJs a string with double quotes when using the j filter"
      },
      {
        name:     "escapeJSON filter",
        source:   "{obj|js|s}",
        context:  { obj: { id: 1, name: "bob", occupation: "construction" } },
        expected: JSON.stringify({ id: 1, name: "bob", occupation: "construction" }),
        message: "should stringify a JSON literal when using the js filter"
      },
      {
        name:     "escapeJSON filter with bad characters",
        source:   "{obj|js|s}",
        context:  { obj: { name: "<<\u2028testLS \u2029testPS"} },
        expected: '{"name":"\\u003c\\u003c\\u2028testLS \\u2029testPS"}',
        message: "should escape bad characters when using the js filter"
      },
      {
        name:     "JSON.parse filter",
        source:   "{obj|jp}",
        context:  { obj: JSON.stringify({ id: 1, name: "bob", occupation: "construction" }) },
        expected: JSON.parse(JSON.stringify({ id: 1, name: "bob", occupation: "construction" })).toString(),
        message: "should objectify a JSON string when using the jp filter"
      },
      {
        name:     "filter receives context",
        source:   "{#dust}{name|woo}{/dust}",
        context:  { woo: 0, name: "Boo", dust: { woo: 5, name: "Dust" } },
        expected: "DUST!!!!!",
        message:  "filters are passed the current context"
      }
    ]
  },
/**
 * PARTIAL DEFINITIONS TESTS
 */
  {
    name: "partial definitions",
    tests: [
      {
        name:     "partial",
        source:   "Hello {name}! You have {count} new messages.",
        context:  { name: "Mick", count: 30 },
        expected: "Hello Mick! You have 30 new messages.",
        message: "should test a basic replace in a template"
      },
      {
        name:     "partial_with_blocks",
        source:   "{+header}default header {/header}Hello {name}! You have {count} new messages.",
        context:  { name: "Mick", count: 30 },
        expected: "default header Hello Mick! You have 30 new messages.",
        message: "should test a block with defaults"
      },
      {
        name:     "partial_with_blocks_and_no_defaults",
        source:   "{+header/}Hello {name}! You have {count} new messages.",
        context:  { name: "Mick", count: 30 },
        expected: "Hello Mick! You have 30 new messages.",
        message: "should test a blocks with no defaults"
      },
      {
        name:     "partial_print_name",
        source:   "{#helper}{/helper}",
        context:  {},
        expected: "",
        message: "should test a template with missing helper"
      },
      {
        name:     "nested_partial_print_name",
        source:   "{>partial_print_name/}",
        context:  {},
        expected: "",
        message: "should test a template with missing helper"
      },
      {
        name:     "nested_nested_partial_print_name",
        source:   "{>nested_partial_print_name/}",
        context:  {},
        expected: "",
        message: "should test nested partial"
      }
    ]
  },
/**
 * PARTIAL/PARAMS TESTS
 */
  {
    name: "partial/params tests",
    tests : [
      {
        name:     "partials",
        source:   '{>partial foo=0 /} {>"hello_world" foo=1 /} {>"{ref}" foo=2 /}',
        context:  { name: "Jim", count: 42, ref: "hello_world" },
        expected: "Hello Jim! You have 42 new messages. Hello World! Hello World!",
        message:  "should test partials"
      },
	  {
		name:	  "partial with async ref as name",
		source:   '{>"{ref}" /}',
		context:  { ref: function(chunk, context) { return chunk.map(function(chunk) { setTimeout(function() { chunk.end('hello_world'); }, 0) }); }},
		expected: "Hello World!",
		message:  "should test partial with an asynchronously-resolved template name"
	  },
      {
        name:     "partial with context",
        source:   "{>partial:.profile/}",
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
        source:   '{>partial name=n count="{c}"/}',
        context:  { n: "Mick", c: 30 },
        expected: "Hello Mick! You have 30 new messages.",
        message: "should test partial with inline params"
      },
      {
        name:     "partial with inline params tree walk up",
        source:   '{#a}{#b}{#c}{#d}{>partial name=n count="{x}"/}{/d}{/c}{/b}{/a}',
        context:  { n: "Mick", x: 30, a:{b:{c:{d:{e:"1"}}}} },
        expected: "Hello Mick! You have 30 new messages.",
        message: "should test partial with inline params tree walk up"
      },
      {
        name:     "partial with inline params and context",
        source:   '{>partial:profile name="{n}" count="{c}"/}',
        context:  { profile:  { n: "Mick", c: 30 } },
        expected: "Hello Mick! You have 30 new messages.",
        message: "should test partial with inline params and context"
      },
      {
        name:     "partial with inline params and context tree walk up",
        source:   '{#profile}{#a}{#b}{#c}{#d}{>partial:profile name=n count="{x}"/}{/d}{/c}{/b}{/a}{/profile}',
        context:  { profile:{ n: "Mick", x: 30, a:{b:{c:{d:{e:"1"}}}} } },
        expected: "Hello Mick! You have 30 new messages.",
        message: "should test partial with inline params and context tree walk up"
      },
      {
        name:     "partial with literal inline param and context",
        source:   '{>partial:profile name="Joe" count="99"/}',
        context:  { profile:  { n: "Mick", count: 30 } },
        expected: "Hello Joe! You have 30 new messages.",
        message: "should test partial with literal inline param and context. Fallback values for name or count are undefined"
      },
      {
        name:     "partial with dynamic name and context",
        source:   '{>"{partialName}":me /}',
        context:  { partialName: "partial", me: { name: "Mick", count: 30 }},
        expected: "Hello Mick! You have 30 new messages.",
        message: "should test partial with dynamic name and a context"
      },
      {
        name:     "partial with dynamic name and context and inline params",
        source:   '{>"{partialName}" name=me.name count=me.count /}',
        context:  { partialName: "partial", me: { name: "Mick", count: 30 }},
        expected: "Hello Mick! You have 30 new messages.",
        message: "should test partial with dynamic name and a context"
      },
      {
        name:     "backcompat (< 2.7.0) compiler with no partial context",
        source:   '{#oldPartial/}',
        context:  { "name": "Mick",
                    "count": 30,
                     oldPartial: function(chunk, context, bodies, params) {
                        return chunk.partial("partial", context, params);
                      }
                  },
        expected: "Hello Mick! You have 30 new messages.",
        message:  "should preserve partials backwards compatibility with compilers pre-2.7"
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
        source:   '{>partial name=n count="{c}"/}{<header}my header {/header}',
        context:  { n: "Mick", c: 30 },
        expected: "Hello Mick! You have 30 new messages.",
        message: "should test partial with no blocks, ignore the override inline partials"
      },
      {
        name:     "partial prints the current template name",
        source:   '{>partial_print_name/}',
        context:  { "helper": function(chunk, context, bodies, params)
                      {
                        currentTemplateName = context.getTemplateName();
                        return chunk.write(currentTemplateName);
                      }
                  },
        expected: "partial_print_name",
        message: "should print the current template name"
      },
      {
        name:     "partial prints the current dynamic template name",
        source:   '{>"{partial_print_name}"/}',
        context:  { "helper": function(chunk, context, bodies, params)
                      {
                        currentTemplateName = context.getTemplateName();
                        return chunk.write(currentTemplateName);
                      },
                    "partial_print_name" : "partial prints the current template name"
                  },
        expected: "partial_print_name",
        message: "should print the current dynamic template name"
      },
      {
        name:     "nested partial prints the current template name",
        source:   '{>nested_partial_print_name/}',
        context:  { "helper": function(chunk, context, bodies, params)
                        {
                          currentTemplateName = context.getTemplateName();
                          return chunk.write(currentTemplateName);
                        }
                    },
        expected: "partial_print_name",
        message: "should print the current template name"
      },
      {
        name:     "nested partial 2 levels deep from loadSource prints the current template name",
        source:   ['{#loadTemplate name="{contentTemplate}" source="{contentSource|s}"}{/loadTemplate}',
                   '{#loadTemplate name="{parentTemplate}" source="{parentSource|s}"}{/loadTemplate}',
                   '{>"{parentTemplate}"/} | additional parent output'].join("\n"),
        context:  { "loadTemplate": function(chunk, context, bodies, params)
                    {
                      var source = context.resolve(params.source),
                          name = context.resolve(params.name);
                      dust.loadSource(dust.compile(source, name));
                      return chunk.write('');
                    },
                    "printTemplateName": function(chunk, context, bodies, params)
                    {
                      return chunk.write(context.getTemplateName());
                    },
                    "parentTemplate": "parent",
                    "parentSource": "{?undefinedVar}{:else}{>\"content\"/}{/undefinedVar}",
                    "contentTemplate": "content",
                    "contentSource": "templateName: {#printTemplateName}{/printTemplateName} output: additional output"

                  },
        expected: "templateName: content output: additional output | additional parent output",
        message: "should print the current template name with some additional output"
      },
      {
        name:     "partial with makeBase_missing_global",
        source:   '{#helper template="partial"}{/helper}',
        context:  { "helper": function(chunk, context, bodies, params)
                    {
                      var newContext = dust.makeBase({});
                      return chunk.partial(params.template, newContext, newContext, {});
                    }
                  },
        expected: "Hello ! You have  new messages.",
        message: "should render the helper with missing global context"
      },
      {
        name: "partial stepping into context that does not exist",
        source: [
          '{#loadPartialTl}{/loadPartialTl}',
          '{>partialTl:contextDoesNotExist/}'
        ].join('\n'),
        context: {
          loadPartialTl : function(chunk, context, bodies, params) {
            dust.loadSource(dust.compile('{.value}{.value.childValue.anotherChild}{name.nested}{$idx} ', 'partialTl'));
            return chunk;
          }
        },
        expected: " ",
        message: "Should gracefully handle stepping into context that does not exist"
      }
    ]
  },
/**
 * INLINE PARAMS TESTS
 */
  {
    name: "inline params tests",
    tests: [
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
        name:     "inline params as negative integer",
        source:   "{#foo bar=-1}{bar}{/foo}",
        context:  {"foo": true},
        expected: "-1",
        message:  "should print negative integer"
      },
      {
        name:     "inline params as negative float",
        source:   "{#foo bar=-1.1}{bar}{/foo}",
        context:  {"foo": true},
        expected: "-1.1",
        message:  "should print negative float"
      },
      {
        name:     "inline params with dashes",
        source:   "{#helper data-foo=\"dashes\" /}",
        context:  { helper: function(chunk, context, bodies, params) { return chunk.write(params['data-foo']); } },
        expected: "dashes",
        message: "should test parameters with dashes"
      },
      {
	name:     "inline params as dust function",
	source:   "{#section a=\"{b}\"}{#a}Hello, {.}!{/a}{/section}",
	context:  {"section": true, "b": "world"},
	expected: "Hello, world!",
	message: "Inline params that evaluate to a dust function should evaluate their body"
      }
    ]
  },
/**
 * INLINE PARTIAL/BLOCK TESTS
 */
  {
    name: "inline partial/block tests",
    tests: [
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
      }
    ]
  },
/**
 * LAMBDA TESTS
 */
  {
    name: "lambda tests",
    tests: [
      {
        name: "test that the scope of the function is correct and that a non-chunk return value is used for truthiness checks",
        source: "Hello {#foo}{#bar}{.}{/bar}{/foo} World!",
        context: {
                   foo: {
                     foobar: 'Foo Bar',
                     bar: function biz() {
                       return this.foobar;
                     }
                   }
                 },
        expected: "Hello Foo Bar World!",
        message: "should test that a non-chunk return value is used for truthiness"
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
          name:     "test that function returning object is resolved",
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
          message: "should test that function returning object is resolved"
        }
    ]
  },
/**
 * CORE GRAMMAR TESTS
 */
  {
    name: "core-grammar tests",
    tests: [
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
        error: 'Expected buffer, comment, end of input, partial, raw, reference, section or special but "{" found. At line : 1, column : 1',
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
        error:    'Expected end tag for helper but it was not found. At line : 1, column : 32',
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
        error: 'Expected buffer, comment, end of input, partial, raw, reference, section or special but "{" found. At line : 1, column : 1',
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
        source: '{ > partial/} {> "hello_world"/} {> "{ref}"/}',
        context: { "name": "Jim", "count": 42, "ref": "hello_world" },
        error: 'Expected buffer, comment, end of input, partial, raw, reference, section or special but "{" found. At line : 1, column : 1',
        message: "should show an error for whitespaces between the '{' plus '>' and partial identifier"
      },
      {
        name: "whitespaces before the forward slash and the closing brace in partials supported",
        source: '{>partial /} {>"hello_world" /} {>"{ref}" /}',
        context: { "name": "Jim", "count": 42, "ref": "hello_world" },
        expected: "Hello Jim! You have 42 new messages. Hello World! Hello World!",
        message: "should ignore extra whitespacesbefore the forward slash and the closing brace in partials"
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
        name: "support dash in key/reference",
        source: 'Hello {first-name}, {last-name}! You have {count} new messages.',
        context: { "first-name": "Mick", "last-name" : "Jagger", "count": 30 },
        expected: "Hello Mick, Jagger! You have 30 new messages.",
        message: "should test using dash in key/reference"
      },
      {
        name: "support dash in partial's key",
        source: '{<title-a}foo-bar{/title-a}{+"{foo-title}-{bar-letter}"/}',
        context: { "foo-title" : "title", "bar-letter": "a" },
        expected: "foo-bar",
        message: "should test dash in partial's keys"
      },
      {
        name: "support dash in partial's params",
        source: '{>partial name=first-name count="{c}"/}',
        context: { "first-name": "Mick", "c": 30 },
        expected: "Hello Mick! You have 30 new messages.",
        message: "should test dash in partial's params"
      },
      {
        name: "support dash in # sections",
        source:   "{#first-names}{name}{/first-names}",
        context:  { "first-names": [ { name: "Moe" }, { name: "Larry" }, { name: "Curly" } ] },
        expected: "MoeLarryCurly",
        message: "should test dash in # sections"
      },
      {
        name:     "support dash in a referece for exists section",
        source:   "{?tags-a}tag found!{:else}No Tags!{/tags-a}" ,
        context:  { "tags-a": "tag" },
        expected: "tag found!",
        message: "should test for dash in a referece for exists section"
      },
      { name:     "base_template with dash in the reference",
        source:   "Start{~n}"       +
                  "{+title-t}"        +
                  "Template Title"    +
                  "{/title-t}"        +
                  "{~n}"            +
                  "{+main-t}"         +
                  "Template Content"  +
                  "{/main-t}"         +
                  "{~n}"            +
                  "End",
        context:  {},
        expected: "Start\nTemplate Title\nTemplate Content\nEnd",
        message: "should test base template with dash in the reference"
      },
      {
        name:     "child_template with dash in the reference",
        source:   "{^xhr-n}tag not found!{:else}tag found!{/xhr-n}",
        context:  {"xhr": false},
        expected: "tag not found!",
        message: "should test child template with dash"
      }
    ]
  },
/**
 * SYNTAX ERROR TESTS
 */
  {
    name: "syntax error tests",
    tests: [
      {
        name: "Dust syntax error",
        source: "RRR {##}",
        context: { name: "Mick", count: 30 },
        error: 'Expected buffer, comment, end of input, partial, raw, reference, section or special but "{" found. At line : 1, column : 5',
        message: "should test that the error message shows line and column."
      },
      {
        name: "Dust syntax error. Error in Section",
        source: ["{#s}",
                "{#&2}",
                "{/s}"].join("\n"),
        context: {},
        error: 'Expected end tag for s but it was not found. At line : 2, column : 1',
        message: "should test the errors message for section with error."
      },
      {
        name: "Dust syntax error. Error in Section with buffer",
        source: ["{#s}",
                "this is the",
                "buffer",
                "{#&2}",
                "a second",
                "buffer",
                "{/s}"].join("\n"),
        context: {},
        error: 'Expected end tag for s but it was not found. At line : 4, column : 1',
        message: "should test the errors message for section with a buffer and error inside."
      },
      {
        name: "Dust syntax error. Error in Section without end tag",
        source: ["{#s}",
                "this is the",
                "buffer",
                "a second",
                "buffer"].join("\n"),
        context: {},
        error: 'Expected end tag for s but it was not found. At line : 5, column : 7',
        message: "should test the errors message for section without end tag shows."
      },
      {
        name: "Dust syntax error. Error in Partial with buffer",
        source: ["{+header}",
                "this is a Partial",
                "with Error",
                "eeee{@#@$fdf}",
                "default header ",
                "{/header}"].join("\n"),
        context: {},
        error: 'Expected end tag for header but it was not found. At line : 4, column : 5',
        message: "should test the errors message for partials with a buffer inside."
      },
      {
        name: "Dust syntax error. Error in Partial without end tag",
        source: ["{+header}",
                "this is the",
                "buffer",
                "a second",
                "buffer"].join("\n"),
        context: {},
        error: 'Expected end tag for header but it was not found. At line : 5, column : 7',
        message: "should test the errors message for partial without end tag."
      },
      {
        name: "Dust syntax error. Error in Scalar",
        source:["{#scalar}",
                "true",
                " {#@#fger}",
                "{:else}",
                "false",
                "{/scalar}"].join("\n"),
        context: {},
        error: 'Expected end tag for scalar but it was not found. At line : 3, column : 2',
        message: "should test the errors message for Scalar."
      },
      {
        name: "Dust syntax error. Error in Scalar's else",
        source:["{#scalar}",
                "true",
                "{:else}",
                "false",
                " {#@#fger}",
                "{/scalar}"].join("\n"),
        context: {},
        error: 'Expected end tag for scalar but it was not found. At line : 5, column : 2',
        message: "should test the errors message for Scalar."
      },
      {
        name: "Dust syntax error. Error in Conditional",
        source:["{?tags}",
                  "<ul>{~n}",
                    "{#tags}{~s}",
                      "<li>{#@$}</li>{~n}",
                    "{/tags}",
                  "</ul>",
                "{:else}",
                  "No Tags!",
                "{/tags}"].join("\n"),
        context: {},
        error: 'Expected end tag for tags but it was not found. At line : 4, column : 5',
        message: "should test the errors message for Conditionals."
      },
      {
        name: "Dust syntax error. Error in Conditional's else",
        source:["{?tags}",
                  "<ul>{~n}",
                    "{#tags}{~s}",
                      "<li>{.}</li>{~n}",
                    "{/tags}",
                  "</ul>",
                "{:else}",
                  "{#@$}",
                  "No Tags!",
                "{/tags}"].join("\n"),
        context: {},
        error: 'Expected end tag for tags but it was not found. At line : 8, column : 1',
        message: "should test the errors message for Conditional's else."
      },
      {
        name: "Dust syntax error. Error in Conditional without end tag",
        source:["{?tags}",
                  "<ul>{~n}",
                    "{#tags}{~s}",
                      "<li>{.}</li>{~n}",
                    "{/tags}",
                  "</ul>",
                "{:else}",
                  "No Tags!"].join("\n"),
        context: {},
        error: 'Expected end tag for tags but it was not found. At line : 8, column : 9',
        message: "should test the errors message for Conditional without end tag."
      },
      {
        name: "Helper syntax error. TypeError",
        source:"{#hello/}",
        context: {"hello":function() { var a; a.slice(1); }},
        error: "undefined",
        message: "should test helper syntax errors being handled gracefully"
      },
      {
        name: "Helper syntax error. async TypeError",
        source:"{#hello/}",
        context: {"hello":function(chunk, context, bodies, params) { return chunk.map(function(chunk) { var a; a.slice(1); chunk.end(); })}},
        error: "undefined",
        message: "should test helper syntax errors inside an async block being handled gracefully"
       }
    ]
  },
/**
 * BUFFER TESTS
 */
  {
    name: "buffer test",
    tests: [
      {
        name: "buffer ",
        source: "{&partial/}",
        context: {},
        expected: "{&partial/}",
        message: "given content should be parsed as buffer"
      }
    ]
  },
/**
 * COMMENT TESTS
 */
  {
    name: "comment test",
    tests: [
      {
        name: "comment",
        source: ["before {!  this is a comment { and } and all sorts of stuff including",
                 "newlines and tabs \t are valid and is simply ignored !}after"].join('\n'),
        context: {},
        expected: "before after",
        message: "comments should be ignored"
      }
    ]
  },
/**
 * WHITESPACE TESTS
 */
  {
    name: "whitespace test",
    tests: [
	  {
		name: "whitespace on: whitespace-only template",
		source: "\n     ",
		context: {},
		expected: "\n     ",
		message: "whitespace on: whitespace-only template is preserved",
		config: { whitespace: true }
	  },
	  {
		name: "whitespace off: whitespace-only template",
		source: "\n     ",
		context: {},
		expected: "",
		message: "whitespace off: whitespace-only template is removed",
		config: { whitespace: false }
	  },
	  {
		name: "whitespace on: whitespace-only block",
		source: "{<foo}\n{/foo}{+foo/}",
		context: {},
		expected: "\n",
		message: "whitespace on: whitespace-only block is preserved",
		config: { whitespace: true }
	  },
	  {
		name: "whitespace off: whitespace-only block",
		source: "{<foo}\n{/foo}{+foo/}",
		context: {},
		expected: "",
		message: "whitespace off: whitespace-only block is removed",
		config: { whitespace: false }
	  },
	  {
        name: "whitespace off: multiline text block runs together",
        source: ["<p>",
                 "    foo bar baz",
                 "    foo bar baz",
                 "</p>"].join('\n'),
        context: {},
        expected: "<p>foo bar bazfoo bar baz</p>",
        message: "whitespace off: multiline text block should run together",
	config: { whitespace: false }
      },
      {
        name: "whitespace off: multiline text block with trailing space does not run together",
        source: ["<p>",
                 "    foo bar baz ",
                 "    foo bar baz",
                 "</p>"].join('\n'),
        context: {},
        expected: "<p>foo bar baz foo bar baz</p>",
        message: "whitespace off: multiline text block with a trailing space should not run together"
      },
      {
        name: "whitespace on: multiline text block",
        source: ["<p>",
                 "    foo bar baz",
                 "    foo bar baz",
                 "</p>"].join('\n'),
        context: {},
        expected: "<p>\n    foo bar baz\n    foo bar baz\n</p>",
        message: "whitespace on: multiline text block should maintain indent",
        config: { whitespace: true }
      },
      {
        name: "whitespace on: partial indentation",
        source: ["<html>",
                 "<head>",
                 "</head>",
                 "<body>{+body/}<body>",
                 "</html>",
                 "{<body}",
                 "    <h1>Title</h1>",
                 "    <p>Content...</p>",
                 "{/body}"].join('\n'),
        context: {},
        expected: ["<html>",
                 "<head>",
                 "</head>",
                 "<body>",
                 "    <h1>Title</h1>",
                 "    <p>Content...</p>",
                 "<body>",
                 "</html>\n"].join('\n'),
        message: "whitespace on: partials should preserve indentation",
        config: { whitespace: true }
      }
    ]
  },
/**
 * RAW TEXT TESTS
 */
  {
    name: "raw text test",
    tests: [
      {
        name: "simple raw text",
        source: ["{`<pre>",
                 'A: "hello"',
                 "              B: 'hello'?",
                 "A: a walrus (:{=",
                 "              B: Lols!",
"               __ ___                              ",
"            .'. -- . '.                            ",
"           /U)  __   (O|                           ",
"          /.'  ()()   '.\._                        ",
"        .',/;,_.--._.;;) . '--..__                 ",
"       /  ,///|.__.|.\\\  \ '.  '.''---..___       ",
"      /'._ '' ||  ||  '' _'\  :   \   '   . '.     ",
"     /        ||  ||        '.,    )   )   :  \    ",
"    :'-.__ _  ||  ||   _ __.' _\_ .'  '   '   ,)   ",
"    (          '  |'        ( __= ___..-._ ( (.\\  ",
"   ('\      .___ ___.      /'.___=          \.\.\  ",
"    \\\-..____________..-''                        ",
                 "</pre>`}"].join('\n'),
        context: {},
        expected: ["<pre>",
                 'A: "hello"',
                 "              B: 'hello'?",
                 "A: a walrus (:{=",
                 "              B: Lols!",
"               __ ___                              ",
"            .'. -- . '.                            ",
"           /U)  __   (O|                           ",
"          /.'  ()()   '.\._                        ",
"        .',/;,_.--._.;;) . '--..__                 ",
"       /  ,///|.__.|.\\\  \ '.  '.''---..___       ",
"      /'._ '' ||  ||  '' _'\  :   \   '   . '.     ",
"     /        ||  ||        '.,    )   )   :  \    ",
"    :'-.__ _  ||  ||   _ __.' _\_ .'  '   '   ,)   ",
"    (          '  |'        ( __= ___..-._ ( (.\\  ",
"   ('\      .___ ___.      /'.___=          \.\.\  ",
"    \\\-..____________..-''                        ",
                 "</pre>"].join('\n'),
        message: "raw text should keep all whitespace"
      },
      {
        name: "raw text more likely example",
        source: ["{#A}",
                 "buffer text",
                 "         !spaces and new lines are nullified (by default). Booo",
                 "{~n}   Starting with newline make it not so bad",
                 "{`<pre>",
                 "but",
                 "  what{",
                 "  \twe",
                 "      want is this",
                 "helpful for:",
                 " * talking about Dust syntax which looks like `{ref}` `{@helpers}`",
                 " * interpolations like 'My name is:`} {#name}{first} {last}{/name}{`",
                 "</pre>`}",
                 "after",
                 "!newline",
                 "{/A}"].join('\n'),
        context: {A:{ name: {first: 'Paul', last: 'Walrus'}}},
        expected: ["buffer text!spaces and new lines are nullified (by default). Booo",
                 "   Starting with newline make it not so bad<pre>",
                 "but",
                 "  what{",
                 "  \twe",
                 "      want is this",
                 "helpful for:",
                 " * talking about Dust syntax which looks like `{ref}` `{@helpers}`",
                 " * interpolations like 'My name is: Paul Walrus",
                 "</pre>after!newline"].join('\n'),
        message: "raw text is not matching"
      },
      {
        name: "using raw to allow {",
        source: ["<div data-fancy-json={`\"{rawJsonKey: 'value'}\"`}>",
                 "</div>"].join('\n'),
        context: {},
        expected: "<div data-fancy-json=\"{rawJsonKey: 'value'}\"></div>",
        message: "raw text should allow {"
      }
    ]
  },
  {
    name: "helper tests",
    tests: [
      {
        name:  "helper returns a primitive",
        source: "{@val value=3/}",
        context: {},
        expected: "3",
        message: "helper can return a primitive"
      },
      {
        name: "helper returns a primitive and renders a body",
        source: '{@val value="world"}Hello {.}{/val}',
        context: {},
        expected: "Hello world",
        message: "helper can return a primitive and render a body"
      },
      {
        name: "helper returns an array and iterates a body",
        source: '{@val value=arr}Hello {name} {/val}',
        context: { arr: [{name:"Alice"},{name:"Bob"},{name:"Charlie"}]},
        expected: "Hello Alice Hello Bob Hello Charlie ",
        message: "helper that returns an array iterates its body"
      },
      {
        name:  "helper escapes a primitive",
        source: '{@val value="You & I"/}',
        context: {},
        expected: "You &amp; I",
        message: "helper escapes returned primitives"
      },
      {
        name: "helper filters a primitive",
        source: '{@val value="You & I" filters="|s"/} {@val value="& Tim" filters="|js|s"/}',
        context: {},
        expected: 'You & I "& Tim"',
        message: "helper applies filters to returned primitives"
      },
      {
        name: "helper filters a primitive using an array of filters",
        source: '{@val value="You & I" filters=filters/}',
        context: { filters: ['js','s']},
        expected: '"You & I"',
        message: "helper filters a primitive using an array of filters"
      },
      {
        name:  "helper returns a chunk",
        source: '{@val value="{hello} & world"/}',
        context: {hello: '<Hello>'},
        expected: "&lt;Hello&gt; & world",
        message: "helper can return a Chunk"
      },
      {
        name:  "helper doesn't filter a chunk",
        source: '{@val value="{hello} & world" filters="|s"/}',
        context: {hello: '<Hello>'},
        expected: "&lt;Hello&gt; & world",
        message: "helper doesn't apply filters to a Chunk"
      },
      {
        name:  "helper filters are affected by pragma",
        source: '{%esc:s}{@val value="You & I"/}{/esc}',
        context: {},
        expected: "You & I",
        message: "helper applies filter from esc pragma"
      },
      {
        name:  "helper filters supercede pragma",
        source: '{%esc:s}{@val value="You & I" filters="|h" /}{/esc}',
        context: {},
        expected: "You &amp; I",
        message: "helper filters supercede filter from esc pragma"
      },
      {
        name:  "Dust < 2.7.1 compat: helpers escape references",
        source: '{#returnLegacy value="You & I" /}',
        context: {
          returnLegacy: function(chunk, context, bodies, params) {
            return chunk.helper('val', context, bodies, params);
          }
        },
        expected: "You &amp; I",
        message: "templates compiled with Dust < 2.7.1 escape values returned from helpers"
      }
    ]
  },
/**
 * INVALID HELPER TESTS
 */
  {
    name: "debugger tests",
    tests: [
      {
        name:     "non-existing helper",
        source:   "some text {@notfound}foo{/notfound} some text",
        context:  {},
        log: "Helper `notfound` does not exist",
        message: "Should crash the application if a helper is not found"
      },
      {
        name:     "invalid filter",
        source:   "{obj|nullcheck|invalid}",
        context:  { obj: "test" },
        log:    "Invalid filter `nullcheck`",
        message: "should fail hard for invalid filter"
      },
      {
        name: "Reference not found",
        source:"{wrong.test}",
        context: {"test": "example text"},
        log: "Cannot find reference `{wrong.test}` in template `Reference not found`",
        message: "test the log messages for a reference not found."
      },
      {
        name: "Section not found",
        source:"{#strangeSection}{/strangeSection}",
        context: {"test": "example text"},
        log: "Section without corresponding key in template `Section not found`",
        message: "test the log messages for an unhandled section."
      },
	  {
		name: "Exists without body",
		source: "{?foo/}",
		context: {"foo": "foo"},
		log: "No block for exists check in template `Exists without body`",
		message: "test the log message for an exists block with no body"
	  },
	  {
		name: "Not exists without body",
		source: "{^foo/}",
		context: {},
		log: "No block for not-exists check in template `Not exists without body`",
		message: "test the log message for a not-exists block with no body"
	  },
	  {
        name: "Errors should be throwable from helpers and consumed in the render callback/stream onerror",
        source: "{@error errorMessage=\"helper error\"}{/error}",
        context: { },
        error: "helper error",
        message: "test to make sure errors are properly caught and propogated to the callbacks."
      }
    ]
  }
];
}));
