//
// Dust - Asynchronous Templating v0.3.0
// http://akdubya.github.com/dustjs
//
// Copyright (c) 2010, Aleksander Williams
// Released under the MIT License.
//

var dust = {};

(function(dust) {

dust.cache = {};

dust.register = function(name, tmpl) {
  if (!name) return;
  dust.cache[name] = tmpl;
};

dust.render = function(name, context, callback) {
  var chunk = new Stub(callback).head;
  dust.load(name, chunk, Context.wrap(context)).end();
};

dust.stream = function(name, context) {
  var stream = new Stream();
  dust.nextTick(function() {
    dust.load(name, stream.head, Context.wrap(context)).end();
  });
  return stream;
};

dust.renderSource = function(source, context, callback) {
  return dust.compileFn(source)(context, callback);
};

dust.compileFn = function(source, name) {
  var tmpl = dust.loadSource(dust.compile(source, name));
  return function(context, callback) {
    var master = callback ? new Stub(callback) : new Stream();
    dust.nextTick(function() {
      tmpl(master.head, Context.wrap(context)).end();
    });
    return master;
  }
};

dust.load = function(name, chunk, context) {
  var tmpl = dust.cache[name];
  if (tmpl) {
    return tmpl(chunk, context);
  } else {
    if (dust.onLoad) {
      return chunk.map(function(chunk) {
        dust.onLoad(name, function(err, src) {
          if (err) return chunk.setError(err);
          if (!dust.cache[name]) dust.loadSource(dust.compile(src, name));
          dust.cache[name](chunk, context).end();
        });
      });
    }
    return chunk.setError(new Error("Template Not Found: " + name));
  }
};

dust.loadSource = function(source, path) {
  return eval(source);
};

if (Array.isArray) {
  dust.isArray = Array.isArray;
} else {
  dust.isArray = function(arr) {
    return Object.prototype.toString.call(arr) == "[object Array]";
  };
}

dust.nextTick = function(callback) {
  setTimeout(callback, 0);
}

dust.isEmpty = function(value) {
  if (dust.isArray(value) && !value.length) return true;
  if (value === 0) return false;
  return (!value);
};

dust.filter = function(string, auto, filters) {
  if (filters) {
    for (var i=0, len=filters.length; i<len; i++) {
      var name = filters[i];
      if (name === "s") {
        auto = null;
      } else {
        string = dust.filters[name](string);
      }
    }
  }
  if (auto) {
    string = dust.filters[auto](string);
  }
  return string;
};

dust.filters = {
  h: function(value) { return dust.escapeHtml(value); },
  j: function(value) { return dust.escapeJs(value); },
  u: encodeURI,
  uc: encodeURIComponent
}

function Context(stack, global, blocks) {
  this.stack  = stack;
  this.global = global;
  this.blocks = blocks;
}

dust.makeBase = function(global) {
  return new Context(new Stack(), global);
}

Context.wrap = function(context) {
  if (context instanceof Context) {
    return context;
  }
  return new Context(new Stack(context));
}

Context.prototype.get = function(key) {
  var ctx = this.stack, value;

  while(ctx) {
    if (ctx.isObject) {
      value = ctx.head[key];
      if (!(value === undefined)) {
        return value;
      }
    }
    ctx = ctx.tail;
  }
  return this.global ? this.global[key] : undefined;
};

Context.prototype.getPath = function(cur, down) {
  var ctx = this.stack,
      len = down.length;

  if (cur && len === 0) return ctx.head;
  if (!ctx.isObject) return undefined;
  ctx = ctx.head;
  var i = 0;
  while(ctx && i < len) {
    ctx = ctx[down[i]];
    i++;
  }
  return ctx;
};

Context.prototype.push = function(head, idx, len) {
  return new Context(new Stack(head, this.stack, idx, len), this.global, this.blocks);
};

Context.prototype.rebase = function(head) {
  return new Context(new Stack(head), this.global, this.blocks);
};

Context.prototype.current = function() {
  return this.stack.head;
};

Context.prototype.getBlock = function(key) {
  var blocks = this.blocks;

  if (!blocks) return;
  var len = blocks.length, fn;
  while (len--) {
    fn = blocks[len][key];
    if (fn) return fn;
  }
}

Context.prototype.shiftBlocks = function(locals) {
  var blocks = this.blocks;

  if (locals) {
    if (!blocks) {
      newBlocks = [locals];
    } else {
      newBlocks = blocks.concat([locals]);
    }
    return new Context(this.stack, this.global, newBlocks);
  }
  return this;
}

function Stack(head, tail, idx, len) {
  this.tail = tail;
  this.isObject = !dust.isArray(head) && head && typeof head === "object";
  this.head = head;
  this.index = idx;
  this.of = len;
}

function Stub(callback) {
  this.head = new Chunk(this);
  this.callback = callback;
  this.out = '';
}

Stub.prototype.flush = function() {
  var chunk = this.head;

  while (chunk) {
    if (chunk.flushable) {
      this.out += chunk.data;
    } else if (chunk.error) {
      this.callback(chunk.error);
      this.flush = function() {};
      return;
    } else {
      return;
    }
    chunk = chunk.next;
    this.head = chunk;
  }
  this.callback(null, this.out);
}

function Stream() {
  this.head = new Chunk(this);
}

Stream.prototype.flush = function() {
  var chunk = this.head;

  while(chunk) {
    if (chunk.flushable) {
      this.emit('data', chunk.data);
    } else if (chunk.error) {
      this.emit('error', chunk.error);
      this.flush = function() {};
      return;
    } else {
      return;
    }
    chunk = chunk.next;
    this.head = chunk;
  }
  this.emit('end');
}

Stream.prototype.emit = function(type, data) {
  var events = this.events;

  if (events && events[type]) {
    events[type](data);
  }
}

Stream.prototype.on = function(type, callback) {
  if (!this.events) {
    this.events = {};
  }
  this.events[type] = callback;
  return this;
}

function Chunk(root, next, taps) {
  this.root = root;
  this.next = next;
  this.data = '';
  this.flushable = false;
  this.taps = taps;
}

Chunk.prototype.write = function(data) {
  var taps  = this.taps;

  if (taps) {
    data = taps.go(data);
  }
  this.data += data;
  return this;
}

Chunk.prototype.end = function(data) {
  if (data) {
    this.write(data);
  }
  this.flushable = true;
  this.root.flush();
  return this;
}

Chunk.prototype.map = function(callback) {
  var cursor = new Chunk(this.root, this.next, this.taps),
      branch = new Chunk(this.root, cursor, this.taps);

  this.next = branch;
  this.flushable = true;
  callback(branch);
  return cursor;
}

Chunk.prototype.tap = function(tap) {
  var taps = this.taps;

  if (taps) {
    this.taps = taps.push(tap);
  } else {
    this.taps = new Tap(tap);
  }
  return this;
}

Chunk.prototype.untap = function() {
  this.taps = this.taps.tail;
  return this;
}

Chunk.prototype.render = function(body, context) {
  return body(this, context);
}

Chunk.prototype.reference = function(elem, context, auto, filters) {
  if (typeof elem === "function") {
    elem = elem(this, context, null, {auto: auto, filters: filters});
    if (elem instanceof Chunk) {
      return elem;
    }
  }
  if (!dust.isEmpty(elem)) {
    return this.write(dust.filter(elem, auto, filters));
  } else {
    return this;
  }
};

Chunk.prototype.section = function(elem, context, bodies, params) {
  if (typeof elem === "function") {
    elem = elem(this, context, bodies, params);
    if (elem instanceof Chunk) {
      return elem;
    }
  }

  var body = bodies.block,
      skip = bodies['else'];

  if (params) {
    context = context.push(params);
  }

  if (dust.isArray(elem)) {
    if (body) {
      var len = elem.length, chunk = this;
      for (var i=0; i<len; i++) {
        chunk = body(chunk, context.push(elem[i], i, len));
      }
      return chunk;
    }
  } else if (elem === true) {
    if (body) return body(this, context);
  } else if (elem || elem === 0) {
    if (body) return body(this, context.push(elem));
  } else if (skip) {
    return skip(this, context);
  }
  return this;
};

Chunk.prototype.exists = function(elem, context, bodies) {
  var body = bodies.block,
      skip = bodies['else'];

  if (!dust.isEmpty(elem)) {
    if (body) return body(this, context);
  } else if (skip) {
    return skip(this, context);
  }
  return this;
}

Chunk.prototype.notexists = function(elem, context, bodies) {
  var body = bodies.block,
      skip = bodies['else'];

  if (dust.isEmpty(elem)) {
    if (body) return body(this, context);
  } else if (skip) {
    return skip(this, context);
  }
  return this;
}

Chunk.prototype.block = function(elem, context, bodies) {
  var body = bodies.block;

  if (elem) {
    body = elem;
  }

  if (body) {
    return body(this, context);
  }
  return this;
};

Chunk.prototype.partial = function(elem, context) {
  if (typeof elem === "function") {
    return this.capture(elem, context, function(name, chunk) {
      dust.load(name, chunk, context).end();
    });
  }
  return dust.load(elem, this, context);
};

Chunk.prototype.helper = function(name, context, bodies, params) {
  return dust.helpers[name](this, context, bodies, params);
};

Chunk.prototype.capture = function(body, context, callback) {
  return this.map(function(chunk) {
    var stub = new Stub(function(err, out) {
      if (err) {
        chunk.setError(err);
      } else {
        callback(out, chunk);
      }
    });
    body(stub.head, context).end();
  });
};

Chunk.prototype.setError = function(err) {
  this.error = err;
  this.root.flush();
  return this;
};

dust.helpers = {
  sep: function(chunk, context, bodies) {
    if (context.stack.index === context.stack.of - 1) {
      return chunk;
    }
    return bodies.block(chunk, context);
  },

  idx: function(chunk, context, bodies) {
    return bodies.block(chunk, context.push(context.stack.index));
  }
}

function Tap(head, tail) {
  this.head = head;
  this.tail = tail;
}

Tap.prototype.push = function(tap) {
  return new Tap(tap, this);
};

Tap.prototype.go = function(value) {
  var tap = this;

  while(tap) {
    value = tap.head(value);
    tap = tap.tail;
  }
  return value;
};

var HCHARS = new RegExp(/[&<>\"]/),
    AMP    = /&/g,
    LT     = /</g,
    GT     = />/g,
    QUOT   = /\"/g;

dust.escapeHtml = function(s) {
  if (typeof s === "string") {
    if (!HCHARS.test(s)) {
      return s;
    }
    return s.replace(AMP,'&amp;').replace(LT,'&lt;').replace(GT,'&gt;').replace(QUOT,'&quot;');
  }
  return s;
};

var BS = /\\/g,
    CR = /\r/g,
    LS = /\u2028/g,
    PS = /\u2029/g,
    NL = /\n/g,
    LF = /\f/g,
    SQ = /'/g,
    DQ = /"/g,
    TB = /\t/g;

dust.escapeJs = function(s) {
  if (typeof s === "string") {
    return s
      .replace(BS, '\\\\')
      .replace(DQ, '\\"')
      .replace(SQ, "\\'")
      .replace(CR, '\\r')
      .replace(LS, '\\u2028')
      .replace(PS, '\\u2029')
      .replace(NL, '\\n')
      .replace(LF, '\\f')
      .replace(TB, "\\t");
  }
  return s;
};

})(dust);

if (typeof exports !== "undefined") {
  if (typeof process !== "undefined") {
      require('./server')(dust);
  }
  module.exports = dust;
}
(function(dust) {

dust.compile = function(source, name) {
  var ast = filterAST(dust.parse(source));
  return compile(ast, name);
};

function filterAST(ast) {
  var context = {};
  return dust.filterNode(context, ast);
}

dust.filterNode = function(context, node) {
  return dust.optimizers[node[0]](context, node);
}

dust.optimizers = {
  body:      compactBuffers,
  buffer:    noop,
  special:   convertSpecial,
  format:    nullify,        // TODO: convert format
  reference: visit,
  "#":       visit,
  "?":       visit,
  "^":       visit,
  "<":       visit,
  "+":       visit,
  "@":       visit,
  "%":       visit,
  partial:   visit,
  context:   visit,
  params:    visit,
  bodies:    visit,
  param:     visit,
  filters:   noop,
  key:       noop,
  path:      noop,
  literal:   noop,
  comment:   nullify
}

dust.pragmas = {
  esc: function(compiler, context, bodies, params) {
    var old = compiler.auto;
    if (!context) context = 'h';
    compiler.auto = (context === 's') ? '' : context;
    var out = compileParts(compiler, bodies.block);
    compiler.auto = old;
    return out;
  }
}

function visit(context, node) {
  var out = [node[0]];
  for (var i=1, len=node.length; i<len; i++) {
    var res = dust.filterNode(context, node[i]);
    if (res) out.push(res);
  }
  return out;
}

// Compacts consecutive buffer nodes into a single node
function compactBuffers(context, node) {
  var out = [node[0]], memo;
  for (var i=1, len=node.length; i<len; i++) {
    var res = dust.filterNode(context, node[i]);
    if (res) {
      if (res[0] === 'buffer') {
        if (memo) {
          memo[1] += res[1];
        } else {
          memo = res;
          out.push(res);
        }
      } else {
        memo = null;
        out.push(res);
      }
    }
  }
  return out;
}

var specialChars = {
  "s": " ",
  "n": "\n",
  "r": "\r",
  "lb": "{",
  "rb": "}"
};

function convertSpecial(context, node) { return ['buffer', specialChars[node[1]]] }
function noop(context, node) { return node }
function nullify(){}

function compile(ast, name) {
  var context = {
    name: name,
    bodies: [],
    blocks: {},
    index: 0,
    auto: "h"
  }

  return "(function(){dust.register("
    + (name ? "\"" + name + "\"" : "null") + ","
    + dust.compileNode(context, ast)
    + ");"
    + compileBlocks(context)
    + compileBodies(context)
    + "return body_0;"
    + "})();";
}

function compileBlocks(context) {
  var out = [],
      blocks = context.blocks;

  for (var name in blocks) {
    out.push(name + ":" + blocks[name]);
  }
  if (out.length) {
    context.blocks = "ctx=ctx.shiftBlocks(blocks);";
    return "var blocks={" + out.join(',') + "};";
  }
  return context.blocks = "";
}

function compileBodies(context) {
  var out = [],
      bodies = context.bodies,
      blx = context.blocks;

  for (var i=0, len=bodies.length; i<len; i++) {
    out[i] = "function body_" + i + "(chk,ctx){"
      + blx + "return chk" + bodies[i] + ";}";
  }
  return out.join('');
}

function compileParts(context, body) {
  var parts = '';
  for (var i=1, len=body.length; i<len; i++) {
    parts += dust.compileNode(context, body[i]);
  }
  return parts;
}

dust.compileNode = function(context, node) {
  return dust.nodes[node[0]](context, node);
}

dust.nodes = {
  body: function(context, node) {
    var id = context.index++, name = "body_" + id;
    context.bodies[id] = compileParts(context, node);
    return name;
  },

  buffer: function(context, node) {
    return ".write(" + escape(node[1]) + ")";
  },

  format: function(context, node) {
    return ".write(" + escape(node[1] + node[2]) + ")";
  },

  reference: function(context, node) {
    return ".reference(" + dust.compileNode(context, node[1])
      + ",ctx," + dust.compileNode(context, node[2]) + ")";
  },

  "#": function(context, node) {
    return compileSection(context, node, "section");
  },

  "?": function(context, node) {
    return compileSection(context, node, "exists");
  },

  "^": function(context, node) {
    return compileSection(context, node, "notexists");
  },

  "<": function(context, node) {
    var bodies = node[4];
    for (var i=1, len=bodies.length; i<len; i++) {
      var param = bodies[i],
          type = param[1][1];
      if (type === "block") {
        context.blocks[node[1].text] = dust.compileNode(context, param[2]);
        return '';
      }
    }
    return '';
  },

  "+": function(context, node) {
    return ".block(ctx.getBlock("
      + escape(node[1].text)
      + ")," + dust.compileNode(context, node[2]) + ","
      + dust.compileNode(context, node[4]) + ","
      + dust.compileNode(context, node[3])
      + ")";
  },

  "@": function(context, node) {
    return ".helper("
      + escape(node[1].text)
      + "," + dust.compileNode(context, node[2]) + ","
      + dust.compileNode(context, node[4]) + ","
      + dust.compileNode(context, node[3])
      + ")";
  },

  "%": function(context, node) {
    // TODO: Move these hacks into pragma precompiler
    var name = node[1][1];
    if (!dust.pragmas[name]) return '';

    var rawBodies = node[4];
    var bodies = {};
    for (var i=1, len=rawBodies.length; i<len; i++) {
      var b = rawBodies[i];
      bodies[b[1][1]] = b[2];
    }

    var rawParams = node[3];
    var params = {};
    for (var i=1, len=rawParams.length; i<len; i++) {
      var p = rawParams[i];
      params[p[1][1]] = p[2][1];
    }

    var ctx = node[2][1] ? node[2][1].text : null;

    return dust.pragmas[name](context, ctx, bodies, params);
  },

  partial: function(context, node) {
    return ".partial("
      + dust.compileNode(context, node[1])
      + "," + dust.compileNode(context, node[2]) + ")";
  },

  context: function(context, node) {
    if (node[1]) {
      return "ctx.rebase(" + dust.compileNode(context, node[1]) + ")";
    }
    return "ctx";
  },

  params: function(context, node) {
    var out = [];
    for (var i=1, len=node.length; i<len; i++) {
      out.push(dust.compileNode(context, node[i]));
    }
    if (out.length) {
      return "{" + out.join(',') + "}";
    }
    return "null";
  },

  bodies: function(context, node) {
    var out = [];
    for (var i=1, len=node.length; i<len; i++) {
      out.push(dust.compileNode(context, node[i]));
    }
    return "{" + out.join(',') + "}";
  },

  param: function(context, node) {
    return dust.compileNode(context, node[1]) + ":" + dust.compileNode(context, node[2]);
  },

  filters: function(context, node) {
    var list = [];
    for (var i=1, len=node.length; i<len; i++) {
      var filter = node[i];
      list.push("\"" + filter + "\"");
    }
    return "\"" + context.auto + "\""
      + (list.length ? ",[" + list.join(',') + "]" : '');
  },

  key: function(context, node) {
    return "ctx.get(\"" + node[1] + "\")";
  },

  path: function(context, node) {
    var current = node[1],
        keys = node[2],
        list = [];

    for (var i=0,len=keys.length; i<len; i++) {
      list.push("\"" + keys[i] + "\"");
    }
    return "ctx.getPath(" + current + ",[" + list.join(',') + "])";
  },

  literal: function(context, node) {
    return escape(node[1]);
  }
}

function compileSection(context, node, cmd) {
  return "." + cmd + "("
    + dust.compileNode(context, node[1])
    + "," + dust.compileNode(context, node[2]) + ","
    + dust.compileNode(context, node[4]) + ","
    + dust.compileNode(context, node[3])
    + ")";
}

var escape = (typeof JSON === "undefined")
  ? function(str) { return "\"" + dust.escapeJs(str) + "\"" }
  : JSON.stringify;

})(typeof exports !== 'undefined' ? exports : window.dust);
(function(dust){

var parser = (function(){
  /* Generated by PEG.js (http://pegjs.majda.cz/). */
  
  var result = {
    /*
     * Parses the input with a generated parser. If the parsing is successfull,
     * returns a value explicitly or implicitly specified by the grammar from
     * which the parser was generated (see |PEG.buildParser|). If the parsing is
     * unsuccessful, throws |PEG.parser.SyntaxError| describing the error.
     */
    parse: function(input) {
      var pos = 0;
      var reportMatchFailures = true;
      var rightmostMatchFailuresPos = 0;
      var rightmostMatchFailuresExpected = [];
      var cache = {};
      
      function padLeft(input, padding, length) {
        var result = input;
        
        var padLength = length - input.length;
        for (var i = 0; i < padLength; i++) {
          result = padding + result;
        }
        
        return result;
      }
      
      function escape(ch) {
        var charCode = ch.charCodeAt(0);
        
        if (charCode < 0xFF) {
          var escapeChar = 'x';
          var length = 2;
        } else {
          var escapeChar = 'u';
          var length = 4;
        }
        
        return '\\' + escapeChar + padLeft(charCode.toString(16).toUpperCase(), '0', length);
      }
      
      function quote(s) {
        /*
         * ECMA-262, 5th ed., 7.8.4: All characters may appear literally in a
         * string literal except for the closing quote character, backslash,
         * carriage return, line separator, paragraph separator, and line feed.
         * Any character may appear in the form of an escape sequence.
         */
        return '"' + s
          .replace(/\\/g, '\\\\')            // backslash
          .replace(/"/g, '\\"')              // closing quote character
          .replace(/\r/g, '\\r')             // carriage return
          .replace(/\n/g, '\\n')             // line feed
          .replace(/[\x80-\uFFFF]/g, escape) // non-ASCII characters
          + '"';
      }
      
      function matchFailed(failure) {
        if (pos < rightmostMatchFailuresPos) {
          return;
        }
        
        if (pos > rightmostMatchFailuresPos) {
          rightmostMatchFailuresPos = pos;
          rightmostMatchFailuresExpected = [];
        }
        
        rightmostMatchFailuresExpected.push(failure);
      }
      
      function parse_body() {
        var cacheKey = "body" + '@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var result1 = [];
        var result2 = parse_part();
        while (result2 !== null) {
          result1.push(result2);
          var result2 = parse_part();
        }
        var result0 = result1 !== null
          ? (function(p) { return ["body"].concat(p) })(result1)
          : null;
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_part() {
        var cacheKey = "part" + '@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var result6 = parse_comment();
        if (result6 !== null) {
          var result0 = result6;
        } else {
          var result5 = parse_section();
          if (result5 !== null) {
            var result0 = result5;
          } else {
            var result4 = parse_partial();
            if (result4 !== null) {
              var result0 = result4;
            } else {
              var result3 = parse_special();
              if (result3 !== null) {
                var result0 = result3;
              } else {
                var result2 = parse_reference();
                if (result2 !== null) {
                  var result0 = result2;
                } else {
                  var result1 = parse_buffer();
                  if (result1 !== null) {
                    var result0 = result1;
                  } else {
                    var result0 = null;;
                  };
                };
              };
            };
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_section() {
        var cacheKey = "section" + '@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var savedReportMatchFailures = reportMatchFailures;
        reportMatchFailures = false;
        var savedPos1 = pos;
        var result8 = parse_sec_tag_start();
        if (result8 !== null) {
          var result9 = parse_rd();
          if (result9 !== null) {
            var result10 = parse_body();
            if (result10 !== null) {
              var result11 = parse_bodies();
              if (result11 !== null) {
                var result12 = parse_end_tag();
                if (result12 !== null) {
                  var result13 = (function() {return result8[1].text === result12.text})() ? '' : null;
                  if (result13 !== null) {
                    var result7 = [result8, result9, result10, result11, result12, result13];
                  } else {
                    var result7 = null;
                    pos = savedPos1;
                  }
                } else {
                  var result7 = null;
                  pos = savedPos1;
                }
              } else {
                var result7 = null;
                pos = savedPos1;
              }
            } else {
              var result7 = null;
              pos = savedPos1;
            }
          } else {
            var result7 = null;
            pos = savedPos1;
          }
        } else {
          var result7 = null;
          pos = savedPos1;
        }
        var result6 = result7 !== null
          ? (function(t, b, e, n) { e.push(["param", ["literal", "block"], b]); t.push(e); return t })(result7[0], result7[2], result7[3], result7[4])
          : null;
        if (result6 !== null) {
          var result0 = result6;
        } else {
          var savedPos0 = pos;
          var result3 = parse_sec_tag_start();
          if (result3 !== null) {
            if (input.substr(pos, 1) === "/") {
              var result4 = "/";
              pos += 1;
            } else {
              var result4 = null;
              if (reportMatchFailures) {
                matchFailed("\"/\"");
              }
            }
            if (result4 !== null) {
              var result5 = parse_rd();
              if (result5 !== null) {
                var result2 = [result3, result4, result5];
              } else {
                var result2 = null;
                pos = savedPos0;
              }
            } else {
              var result2 = null;
              pos = savedPos0;
            }
          } else {
            var result2 = null;
            pos = savedPos0;
          }
          var result1 = result2 !== null
            ? (function(t) { t.push(["bodies"]); return t })(result2[0])
            : null;
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        reportMatchFailures = savedReportMatchFailures;
        if (reportMatchFailures && result0 === null) {
          matchFailed("section");
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_sec_tag_start() {
        var cacheKey = "sec_tag_start" + '@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var result2 = parse_ld();
        if (result2 !== null) {
          if (input.substr(pos).match(/^[#?^<+@%]/) !== null) {
            var result3 = input.charAt(pos);
            pos++;
          } else {
            var result3 = null;
            if (reportMatchFailures) {
              matchFailed("[#?^<+@%]");
            }
          }
          if (result3 !== null) {
            var result4 = parse_identifier();
            if (result4 !== null) {
              var result5 = parse_context();
              if (result5 !== null) {
                var result6 = parse_params();
                if (result6 !== null) {
                  var result1 = [result2, result3, result4, result5, result6];
                } else {
                  var result1 = null;
                  pos = savedPos0;
                }
              } else {
                var result1 = null;
                pos = savedPos0;
              }
            } else {
              var result1 = null;
              pos = savedPos0;
            }
          } else {
            var result1 = null;
            pos = savedPos0;
          }
        } else {
          var result1 = null;
          pos = savedPos0;
        }
        var result0 = result1 !== null
          ? (function(t, n, c, p) { return [t, n, c, p] })(result1[1], result1[2], result1[3], result1[4])
          : null;
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_end_tag() {
        var cacheKey = "end_tag" + '@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var savedReportMatchFailures = reportMatchFailures;
        reportMatchFailures = false;
        var savedPos0 = pos;
        var result2 = parse_ld();
        if (result2 !== null) {
          if (input.substr(pos, 1) === "/") {
            var result3 = "/";
            pos += 1;
          } else {
            var result3 = null;
            if (reportMatchFailures) {
              matchFailed("\"/\"");
            }
          }
          if (result3 !== null) {
            var result4 = parse_identifier();
            if (result4 !== null) {
              var result5 = parse_rd();
              if (result5 !== null) {
                var result1 = [result2, result3, result4, result5];
              } else {
                var result1 = null;
                pos = savedPos0;
              }
            } else {
              var result1 = null;
              pos = savedPos0;
            }
          } else {
            var result1 = null;
            pos = savedPos0;
          }
        } else {
          var result1 = null;
          pos = savedPos0;
        }
        var result0 = result1 !== null
          ? (function(n) { return n })(result1[2])
          : null;
        reportMatchFailures = savedReportMatchFailures;
        if (reportMatchFailures && result0 === null) {
          matchFailed("end tag");
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_context() {
        var cacheKey = "context" + '@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        if (input.substr(pos, 1) === ":") {
          var result4 = ":";
          pos += 1;
        } else {
          var result4 = null;
          if (reportMatchFailures) {
            matchFailed("\":\"");
          }
        }
        if (result4 !== null) {
          var result5 = parse_identifier();
          if (result5 !== null) {
            var result3 = [result4, result5];
          } else {
            var result3 = null;
            pos = savedPos0;
          }
        } else {
          var result3 = null;
          pos = savedPos0;
        }
        var result2 = result3 !== null
          ? (function(n) {return n})(result3[1])
          : null;
        var result1 = result2 !== null ? result2 : '';
        var result0 = result1 !== null
          ? (function(n) { return n ? ["context", n] : ["context"] })(result1)
          : null;
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_params() {
        var cacheKey = "params" + '@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var savedReportMatchFailures = reportMatchFailures;
        reportMatchFailures = false;
        var result1 = [];
        var savedPos0 = pos;
        var result4 = parse_ws();
        if (result4 !== null) {
          var result5 = parse_key();
          if (result5 !== null) {
            if (input.substr(pos, 1) === "=") {
              var result6 = "=";
              pos += 1;
            } else {
              var result6 = null;
              if (reportMatchFailures) {
                matchFailed("\"=\"");
              }
            }
            if (result6 !== null) {
              var result9 = parse_identifier();
              if (result9 !== null) {
                var result7 = result9;
              } else {
                var result8 = parse_inline();
                if (result8 !== null) {
                  var result7 = result8;
                } else {
                  var result7 = null;;
                };
              }
              if (result7 !== null) {
                var result3 = [result4, result5, result6, result7];
              } else {
                var result3 = null;
                pos = savedPos0;
              }
            } else {
              var result3 = null;
              pos = savedPos0;
            }
          } else {
            var result3 = null;
            pos = savedPos0;
          }
        } else {
          var result3 = null;
          pos = savedPos0;
        }
        var result2 = result3 !== null
          ? (function(k, v) {return ["param", ["literal", k], v]})(result3[1], result3[3])
          : null;
        while (result2 !== null) {
          result1.push(result2);
          var savedPos0 = pos;
          var result4 = parse_ws();
          if (result4 !== null) {
            var result5 = parse_key();
            if (result5 !== null) {
              if (input.substr(pos, 1) === "=") {
                var result6 = "=";
                pos += 1;
              } else {
                var result6 = null;
                if (reportMatchFailures) {
                  matchFailed("\"=\"");
                }
              }
              if (result6 !== null) {
                var result9 = parse_identifier();
                if (result9 !== null) {
                  var result7 = result9;
                } else {
                  var result8 = parse_inline();
                  if (result8 !== null) {
                    var result7 = result8;
                  } else {
                    var result7 = null;;
                  };
                }
                if (result7 !== null) {
                  var result3 = [result4, result5, result6, result7];
                } else {
                  var result3 = null;
                  pos = savedPos0;
                }
              } else {
                var result3 = null;
                pos = savedPos0;
              }
            } else {
              var result3 = null;
              pos = savedPos0;
            }
          } else {
            var result3 = null;
            pos = savedPos0;
          }
          var result2 = result3 !== null
            ? (function(k, v) {return ["param", ["literal", k], v]})(result3[1], result3[3])
            : null;
        }
        var result0 = result1 !== null
          ? (function(p) { return ["params"].concat(p) })(result1)
          : null;
        reportMatchFailures = savedReportMatchFailures;
        if (reportMatchFailures && result0 === null) {
          matchFailed("params");
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_bodies() {
        var cacheKey = "bodies" + '@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var savedReportMatchFailures = reportMatchFailures;
        reportMatchFailures = false;
        var result1 = [];
        var savedPos0 = pos;
        var result4 = parse_ld();
        if (result4 !== null) {
          if (input.substr(pos, 1) === ":") {
            var result5 = ":";
            pos += 1;
          } else {
            var result5 = null;
            if (reportMatchFailures) {
              matchFailed("\":\"");
            }
          }
          if (result5 !== null) {
            var result6 = parse_key();
            if (result6 !== null) {
              var result7 = parse_rd();
              if (result7 !== null) {
                var result8 = parse_body();
                if (result8 !== null) {
                  var result3 = [result4, result5, result6, result7, result8];
                } else {
                  var result3 = null;
                  pos = savedPos0;
                }
              } else {
                var result3 = null;
                pos = savedPos0;
              }
            } else {
              var result3 = null;
              pos = savedPos0;
            }
          } else {
            var result3 = null;
            pos = savedPos0;
          }
        } else {
          var result3 = null;
          pos = savedPos0;
        }
        var result2 = result3 !== null
          ? (function(k, v) {return ["param", ["literal", k], v]})(result3[2], result3[4])
          : null;
        while (result2 !== null) {
          result1.push(result2);
          var savedPos0 = pos;
          var result4 = parse_ld();
          if (result4 !== null) {
            if (input.substr(pos, 1) === ":") {
              var result5 = ":";
              pos += 1;
            } else {
              var result5 = null;
              if (reportMatchFailures) {
                matchFailed("\":\"");
              }
            }
            if (result5 !== null) {
              var result6 = parse_key();
              if (result6 !== null) {
                var result7 = parse_rd();
                if (result7 !== null) {
                  var result8 = parse_body();
                  if (result8 !== null) {
                    var result3 = [result4, result5, result6, result7, result8];
                  } else {
                    var result3 = null;
                    pos = savedPos0;
                  }
                } else {
                  var result3 = null;
                  pos = savedPos0;
                }
              } else {
                var result3 = null;
                pos = savedPos0;
              }
            } else {
              var result3 = null;
              pos = savedPos0;
            }
          } else {
            var result3 = null;
            pos = savedPos0;
          }
          var result2 = result3 !== null
            ? (function(k, v) {return ["param", ["literal", k], v]})(result3[2], result3[4])
            : null;
        }
        var result0 = result1 !== null
          ? (function(p) { return ["bodies"].concat(p) })(result1)
          : null;
        reportMatchFailures = savedReportMatchFailures;
        if (reportMatchFailures && result0 === null) {
          matchFailed("bodies");
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_reference() {
        var cacheKey = "reference" + '@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var savedReportMatchFailures = reportMatchFailures;
        reportMatchFailures = false;
        var savedPos0 = pos;
        var result2 = parse_ld();
        if (result2 !== null) {
          var result3 = parse_identifier();
          if (result3 !== null) {
            var result4 = parse_filters();
            if (result4 !== null) {
              var result5 = parse_rd();
              if (result5 !== null) {
                var result1 = [result2, result3, result4, result5];
              } else {
                var result1 = null;
                pos = savedPos0;
              }
            } else {
              var result1 = null;
              pos = savedPos0;
            }
          } else {
            var result1 = null;
            pos = savedPos0;
          }
        } else {
          var result1 = null;
          pos = savedPos0;
        }
        var result0 = result1 !== null
          ? (function(n, f) { return ["reference", n, f] })(result1[1], result1[2])
          : null;
        reportMatchFailures = savedReportMatchFailures;
        if (reportMatchFailures && result0 === null) {
          matchFailed("reference");
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_partial() {
        var cacheKey = "partial" + '@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var savedReportMatchFailures = reportMatchFailures;
        reportMatchFailures = false;
        var savedPos0 = pos;
        var result2 = parse_ld();
        if (result2 !== null) {
          if (input.substr(pos, 1) === ">") {
            var result3 = ">";
            pos += 1;
          } else {
            var result3 = null;
            if (reportMatchFailures) {
              matchFailed("\">\"");
            }
          }
          if (result3 !== null) {
            var result10 = parse_key();
            var result9 = result10 !== null
              ? (function(k) {return ["literal", k]})(result10)
              : null;
            if (result9 !== null) {
              var result4 = result9;
            } else {
              var result8 = parse_inline();
              if (result8 !== null) {
                var result4 = result8;
              } else {
                var result4 = null;;
              };
            }
            if (result4 !== null) {
              var result5 = parse_context();
              if (result5 !== null) {
                if (input.substr(pos, 1) === "/") {
                  var result6 = "/";
                  pos += 1;
                } else {
                  var result6 = null;
                  if (reportMatchFailures) {
                    matchFailed("\"/\"");
                  }
                }
                if (result6 !== null) {
                  var result7 = parse_rd();
                  if (result7 !== null) {
                    var result1 = [result2, result3, result4, result5, result6, result7];
                  } else {
                    var result1 = null;
                    pos = savedPos0;
                  }
                } else {
                  var result1 = null;
                  pos = savedPos0;
                }
              } else {
                var result1 = null;
                pos = savedPos0;
              }
            } else {
              var result1 = null;
              pos = savedPos0;
            }
          } else {
            var result1 = null;
            pos = savedPos0;
          }
        } else {
          var result1 = null;
          pos = savedPos0;
        }
        var result0 = result1 !== null
          ? (function(n, c) { return ["partial", n, c] })(result1[2], result1[3])
          : null;
        reportMatchFailures = savedReportMatchFailures;
        if (reportMatchFailures && result0 === null) {
          matchFailed("partial");
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_filters() {
        var cacheKey = "filters" + '@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var savedReportMatchFailures = reportMatchFailures;
        reportMatchFailures = false;
        var result1 = [];
        var savedPos0 = pos;
        if (input.substr(pos, 1) === "|") {
          var result4 = "|";
          pos += 1;
        } else {
          var result4 = null;
          if (reportMatchFailures) {
            matchFailed("\"|\"");
          }
        }
        if (result4 !== null) {
          var result5 = parse_key();
          if (result5 !== null) {
            var result3 = [result4, result5];
          } else {
            var result3 = null;
            pos = savedPos0;
          }
        } else {
          var result3 = null;
          pos = savedPos0;
        }
        var result2 = result3 !== null
          ? (function(n) {return n})(result3[1])
          : null;
        while (result2 !== null) {
          result1.push(result2);
          var savedPos0 = pos;
          if (input.substr(pos, 1) === "|") {
            var result4 = "|";
            pos += 1;
          } else {
            var result4 = null;
            if (reportMatchFailures) {
              matchFailed("\"|\"");
            }
          }
          if (result4 !== null) {
            var result5 = parse_key();
            if (result5 !== null) {
              var result3 = [result4, result5];
            } else {
              var result3 = null;
              pos = savedPos0;
            }
          } else {
            var result3 = null;
            pos = savedPos0;
          }
          var result2 = result3 !== null
            ? (function(n) {return n})(result3[1])
            : null;
        }
        var result0 = result1 !== null
          ? (function(f) { return ["filters"].concat(f) })(result1)
          : null;
        reportMatchFailures = savedReportMatchFailures;
        if (reportMatchFailures && result0 === null) {
          matchFailed("filters");
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_special() {
        var cacheKey = "special" + '@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var savedReportMatchFailures = reportMatchFailures;
        reportMatchFailures = false;
        var savedPos0 = pos;
        var result2 = parse_ld();
        if (result2 !== null) {
          if (input.substr(pos, 1) === "~") {
            var result3 = "~";
            pos += 1;
          } else {
            var result3 = null;
            if (reportMatchFailures) {
              matchFailed("\"~\"");
            }
          }
          if (result3 !== null) {
            var result4 = parse_key();
            if (result4 !== null) {
              var result5 = parse_rd();
              if (result5 !== null) {
                var result1 = [result2, result3, result4, result5];
              } else {
                var result1 = null;
                pos = savedPos0;
              }
            } else {
              var result1 = null;
              pos = savedPos0;
            }
          } else {
            var result1 = null;
            pos = savedPos0;
          }
        } else {
          var result1 = null;
          pos = savedPos0;
        }
        var result0 = result1 !== null
          ? (function(k) { return ["special", k] })(result1[2])
          : null;
        reportMatchFailures = savedReportMatchFailures;
        if (reportMatchFailures && result0 === null) {
          matchFailed("special");
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_identifier() {
        var cacheKey = "identifier" + '@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var savedReportMatchFailures = reportMatchFailures;
        reportMatchFailures = false;
        var result4 = parse_path();
        var result3 = result4 !== null
          ? (function(p) { return wrap(["path"].concat(p), cacheKey) })(result4)
          : null;
        if (result3 !== null) {
          var result0 = result3;
        } else {
          var result2 = parse_key();
          var result1 = result2 !== null
            ? (function(k) { return wrap(["key", k], cacheKey) })(result2)
            : null;
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        reportMatchFailures = savedReportMatchFailures;
        if (reportMatchFailures && result0 === null) {
          matchFailed("identifier");
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_path() {
        var cacheKey = "path" + '@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var savedReportMatchFailures = reportMatchFailures;
        reportMatchFailures = false;
        var savedPos0 = pos;
        var result11 = parse_key();
        var result5 = result11 !== null ? result11 : '';
        if (result5 !== null) {
          var savedPos1 = pos;
          if (input.substr(pos, 1) === ".") {
            var result9 = ".";
            pos += 1;
          } else {
            var result9 = null;
            if (reportMatchFailures) {
              matchFailed("\".\"");
            }
          }
          if (result9 !== null) {
            var result10 = parse_key();
            if (result10 !== null) {
              var result8 = [result9, result10];
            } else {
              var result8 = null;
              pos = savedPos1;
            }
          } else {
            var result8 = null;
            pos = savedPos1;
          }
          var result7 = result8 !== null
            ? (function(k) {return k})(result8[1])
            : null;
          if (result7 !== null) {
            var result6 = [];
            while (result7 !== null) {
              result6.push(result7);
              var savedPos1 = pos;
              if (input.substr(pos, 1) === ".") {
                var result9 = ".";
                pos += 1;
              } else {
                var result9 = null;
                if (reportMatchFailures) {
                  matchFailed("\".\"");
                }
              }
              if (result9 !== null) {
                var result10 = parse_key();
                if (result10 !== null) {
                  var result8 = [result9, result10];
                } else {
                  var result8 = null;
                  pos = savedPos1;
                }
              } else {
                var result8 = null;
                pos = savedPos1;
              }
              var result7 = result8 !== null
                ? (function(k) {return k})(result8[1])
                : null;
            }
          } else {
            var result6 = null;
          }
          if (result6 !== null) {
            var result4 = [result5, result6];
          } else {
            var result4 = null;
            pos = savedPos0;
          }
        } else {
          var result4 = null;
          pos = savedPos0;
        }
        var result3 = result4 !== null
          ? (function(k, d) {
              if (k) { d.unshift(k); return [false, d]; }
              return [true, d];
            })(result4[0], result4[1])
          : null;
        if (result3 !== null) {
          var result0 = result3;
        } else {
          if (input.substr(pos, 1) === ".") {
            var result2 = ".";
            pos += 1;
          } else {
            var result2 = null;
            if (reportMatchFailures) {
              matchFailed("\".\"");
            }
          }
          var result1 = result2 !== null
            ? (function() { return [true, []] })()
            : null;
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        reportMatchFailures = savedReportMatchFailures;
        if (reportMatchFailures && result0 === null) {
          matchFailed("path");
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_key() {
        var cacheKey = "key" + '@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var savedReportMatchFailures = reportMatchFailures;
        reportMatchFailures = false;
        var savedPos0 = pos;
        if (input.substr(pos).match(/^[a-zA-Z_$]/) !== null) {
          var result2 = input.charAt(pos);
          pos++;
        } else {
          var result2 = null;
          if (reportMatchFailures) {
            matchFailed("[a-zA-Z_$]");
          }
        }
        if (result2 !== null) {
          var result3 = [];
          if (input.substr(pos).match(/^[0-9a-zA-Z_$]/) !== null) {
            var result4 = input.charAt(pos);
            pos++;
          } else {
            var result4 = null;
            if (reportMatchFailures) {
              matchFailed("[0-9a-zA-Z_$]");
            }
          }
          while (result4 !== null) {
            result3.push(result4);
            if (input.substr(pos).match(/^[0-9a-zA-Z_$]/) !== null) {
              var result4 = input.charAt(pos);
              pos++;
            } else {
              var result4 = null;
              if (reportMatchFailures) {
                matchFailed("[0-9a-zA-Z_$]");
              }
            }
          }
          if (result3 !== null) {
            var result1 = [result2, result3];
          } else {
            var result1 = null;
            pos = savedPos0;
          }
        } else {
          var result1 = null;
          pos = savedPos0;
        }
        var result0 = result1 !== null
          ? (function(h, t) { return h + t.join('') })(result1[0], result1[1])
          : null;
        reportMatchFailures = savedReportMatchFailures;
        if (reportMatchFailures && result0 === null) {
          matchFailed("key");
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_inline() {
        var cacheKey = "inline" + '@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var savedReportMatchFailures = reportMatchFailures;
        reportMatchFailures = false;
        var savedPos2 = pos;
        if (input.substr(pos, 1) === "\"") {
          var result14 = "\"";
          pos += 1;
        } else {
          var result14 = null;
          if (reportMatchFailures) {
            matchFailed("\"\\\"\"");
          }
        }
        if (result14 !== null) {
          if (input.substr(pos, 1) === "\"") {
            var result15 = "\"";
            pos += 1;
          } else {
            var result15 = null;
            if (reportMatchFailures) {
              matchFailed("\"\\\"\"");
            }
          }
          if (result15 !== null) {
            var result13 = [result14, result15];
          } else {
            var result13 = null;
            pos = savedPos2;
          }
        } else {
          var result13 = null;
          pos = savedPos2;
        }
        var result12 = result13 !== null
          ? (function() { return ["literal", ""] })()
          : null;
        if (result12 !== null) {
          var result0 = result12;
        } else {
          var savedPos1 = pos;
          if (input.substr(pos, 1) === "\"") {
            var result9 = "\"";
            pos += 1;
          } else {
            var result9 = null;
            if (reportMatchFailures) {
              matchFailed("\"\\\"\"");
            }
          }
          if (result9 !== null) {
            var result10 = parse_literal();
            if (result10 !== null) {
              if (input.substr(pos, 1) === "\"") {
                var result11 = "\"";
                pos += 1;
              } else {
                var result11 = null;
                if (reportMatchFailures) {
                  matchFailed("\"\\\"\"");
                }
              }
              if (result11 !== null) {
                var result8 = [result9, result10, result11];
              } else {
                var result8 = null;
                pos = savedPos1;
              }
            } else {
              var result8 = null;
              pos = savedPos1;
            }
          } else {
            var result8 = null;
            pos = savedPos1;
          }
          var result7 = result8 !== null
            ? (function(l) { return ["literal", l] })(result8[1])
            : null;
          if (result7 !== null) {
            var result0 = result7;
          } else {
            var savedPos0 = pos;
            if (input.substr(pos, 1) === "\"") {
              var result3 = "\"";
              pos += 1;
            } else {
              var result3 = null;
              if (reportMatchFailures) {
                matchFailed("\"\\\"\"");
              }
            }
            if (result3 !== null) {
              var result6 = parse_inline_part();
              if (result6 !== null) {
                var result4 = [];
                while (result6 !== null) {
                  result4.push(result6);
                  var result6 = parse_inline_part();
                }
              } else {
                var result4 = null;
              }
              if (result4 !== null) {
                if (input.substr(pos, 1) === "\"") {
                  var result5 = "\"";
                  pos += 1;
                } else {
                  var result5 = null;
                  if (reportMatchFailures) {
                    matchFailed("\"\\\"\"");
                  }
                }
                if (result5 !== null) {
                  var result2 = [result3, result4, result5];
                } else {
                  var result2 = null;
                  pos = savedPos0;
                }
              } else {
                var result2 = null;
                pos = savedPos0;
              }
            } else {
              var result2 = null;
              pos = savedPos0;
            }
            var result1 = result2 !== null
              ? (function(p) { return ["body"].concat(p) })(result2[1])
              : null;
            if (result1 !== null) {
              var result0 = result1;
            } else {
              var result0 = null;;
            };
          };
        }
        reportMatchFailures = savedReportMatchFailures;
        if (reportMatchFailures && result0 === null) {
          matchFailed("inline");
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_inline_part() {
        var cacheKey = "inline_part" + '@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var result4 = parse_special();
        if (result4 !== null) {
          var result0 = result4;
        } else {
          var result3 = parse_reference();
          if (result3 !== null) {
            var result0 = result3;
          } else {
            var result2 = parse_literal();
            var result1 = result2 !== null
              ? (function(l) { return ["buffer", l] })(result2)
              : null;
            if (result1 !== null) {
              var result0 = result1;
            } else {
              var result0 = null;;
            };
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_buffer() {
        var cacheKey = "buffer" + '@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var savedReportMatchFailures = reportMatchFailures;
        reportMatchFailures = false;
        var savedPos4 = pos;
        var result14 = parse_eol();
        if (result14 !== null) {
          var result15 = [];
          var result16 = parse_ws();
          while (result16 !== null) {
            result15.push(result16);
            var result16 = parse_ws();
          }
          if (result15 !== null) {
            var result13 = [result14, result15];
          } else {
            var result13 = null;
            pos = savedPos4;
          }
        } else {
          var result13 = null;
          pos = savedPos4;
        }
        var result12 = result13 !== null
          ? (function(e, w) { return ["format", e, w.join('')] })(result13[0], result13[1])
          : null;
        if (result12 !== null) {
          var result0 = result12;
        } else {
          var savedPos0 = pos;
          var savedPos3 = pos;
          var savedReportMatchFailuresVar2 = reportMatchFailures;
          reportMatchFailures = false;
          var result11 = parse_tag();
          reportMatchFailures = savedReportMatchFailuresVar2;
          if (result11 === null) {
            var result5 = '';
          } else {
            var result5 = null;
            pos = savedPos3;
          }
          if (result5 !== null) {
            var savedPos2 = pos;
            var savedReportMatchFailuresVar1 = reportMatchFailures;
            reportMatchFailures = false;
            var result10 = parse_eol();
            reportMatchFailures = savedReportMatchFailuresVar1;
            if (result10 === null) {
              var result6 = '';
            } else {
              var result6 = null;
              pos = savedPos2;
            }
            if (result6 !== null) {
              var savedPos1 = pos;
              var savedReportMatchFailuresVar0 = reportMatchFailures;
              reportMatchFailures = false;
              var result9 = parse_comment();
              reportMatchFailures = savedReportMatchFailuresVar0;
              if (result9 === null) {
                var result7 = '';
              } else {
                var result7 = null;
                pos = savedPos1;
              }
              if (result7 !== null) {
                if (input.length > pos) {
                  var result8 = input.charAt(pos);
                  pos++;
                } else {
                  var result8 = null;
                  if (reportMatchFailures) {
                    matchFailed('any character');
                  }
                }
                if (result8 !== null) {
                  var result4 = [result5, result6, result7, result8];
                } else {
                  var result4 = null;
                  pos = savedPos0;
                }
              } else {
                var result4 = null;
                pos = savedPos0;
              }
            } else {
              var result4 = null;
              pos = savedPos0;
            }
          } else {
            var result4 = null;
            pos = savedPos0;
          }
          var result3 = result4 !== null
            ? (function(c) {return c})(result4[3])
            : null;
          if (result3 !== null) {
            var result2 = [];
            while (result3 !== null) {
              result2.push(result3);
              var savedPos0 = pos;
              var savedPos3 = pos;
              var savedReportMatchFailuresVar2 = reportMatchFailures;
              reportMatchFailures = false;
              var result11 = parse_tag();
              reportMatchFailures = savedReportMatchFailuresVar2;
              if (result11 === null) {
                var result5 = '';
              } else {
                var result5 = null;
                pos = savedPos3;
              }
              if (result5 !== null) {
                var savedPos2 = pos;
                var savedReportMatchFailuresVar1 = reportMatchFailures;
                reportMatchFailures = false;
                var result10 = parse_eol();
                reportMatchFailures = savedReportMatchFailuresVar1;
                if (result10 === null) {
                  var result6 = '';
                } else {
                  var result6 = null;
                  pos = savedPos2;
                }
                if (result6 !== null) {
                  var savedPos1 = pos;
                  var savedReportMatchFailuresVar0 = reportMatchFailures;
                  reportMatchFailures = false;
                  var result9 = parse_comment();
                  reportMatchFailures = savedReportMatchFailuresVar0;
                  if (result9 === null) {
                    var result7 = '';
                  } else {
                    var result7 = null;
                    pos = savedPos1;
                  }
                  if (result7 !== null) {
                    if (input.length > pos) {
                      var result8 = input.charAt(pos);
                      pos++;
                    } else {
                      var result8 = null;
                      if (reportMatchFailures) {
                        matchFailed('any character');
                      }
                    }
                    if (result8 !== null) {
                      var result4 = [result5, result6, result7, result8];
                    } else {
                      var result4 = null;
                      pos = savedPos0;
                    }
                  } else {
                    var result4 = null;
                    pos = savedPos0;
                  }
                } else {
                  var result4 = null;
                  pos = savedPos0;
                }
              } else {
                var result4 = null;
                pos = savedPos0;
              }
              var result3 = result4 !== null
                ? (function(c) {return c})(result4[3])
                : null;
            }
          } else {
            var result2 = null;
          }
          var result1 = result2 !== null
            ? (function(b) { return ["buffer", b.join('')] })(result2)
            : null;
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        reportMatchFailures = savedReportMatchFailures;
        if (reportMatchFailures && result0 === null) {
          matchFailed("buffer");
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_literal() {
        var cacheKey = "literal" + '@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var savedReportMatchFailures = reportMatchFailures;
        reportMatchFailures = false;
        var savedPos0 = pos;
        var savedPos2 = pos;
        var savedReportMatchFailuresVar1 = reportMatchFailures;
        reportMatchFailures = false;
        var result10 = parse_tag();
        reportMatchFailures = savedReportMatchFailuresVar1;
        if (result10 === null) {
          var result4 = '';
        } else {
          var result4 = null;
          pos = savedPos2;
        }
        if (result4 !== null) {
          var savedPos1 = pos;
          var savedReportMatchFailuresVar0 = reportMatchFailures;
          reportMatchFailures = false;
          var result9 = parse_eol();
          reportMatchFailures = savedReportMatchFailuresVar0;
          if (result9 === null) {
            var result5 = '';
          } else {
            var result5 = null;
            pos = savedPos1;
          }
          if (result5 !== null) {
            var result8 = parse_esc();
            if (result8 !== null) {
              var result6 = result8;
            } else {
              if (input.substr(pos).match(/^[^"]/) !== null) {
                var result7 = input.charAt(pos);
                pos++;
              } else {
                var result7 = null;
                if (reportMatchFailures) {
                  matchFailed("[^\"]");
                }
              }
              if (result7 !== null) {
                var result6 = result7;
              } else {
                var result6 = null;;
              };
            }
            if (result6 !== null) {
              var result3 = [result4, result5, result6];
            } else {
              var result3 = null;
              pos = savedPos0;
            }
          } else {
            var result3 = null;
            pos = savedPos0;
          }
        } else {
          var result3 = null;
          pos = savedPos0;
        }
        var result2 = result3 !== null
          ? (function(c) {return c})(result3[2])
          : null;
        if (result2 !== null) {
          var result1 = [];
          while (result2 !== null) {
            result1.push(result2);
            var savedPos0 = pos;
            var savedPos2 = pos;
            var savedReportMatchFailuresVar1 = reportMatchFailures;
            reportMatchFailures = false;
            var result10 = parse_tag();
            reportMatchFailures = savedReportMatchFailuresVar1;
            if (result10 === null) {
              var result4 = '';
            } else {
              var result4 = null;
              pos = savedPos2;
            }
            if (result4 !== null) {
              var savedPos1 = pos;
              var savedReportMatchFailuresVar0 = reportMatchFailures;
              reportMatchFailures = false;
              var result9 = parse_eol();
              reportMatchFailures = savedReportMatchFailuresVar0;
              if (result9 === null) {
                var result5 = '';
              } else {
                var result5 = null;
                pos = savedPos1;
              }
              if (result5 !== null) {
                var result8 = parse_esc();
                if (result8 !== null) {
                  var result6 = result8;
                } else {
                  if (input.substr(pos).match(/^[^"]/) !== null) {
                    var result7 = input.charAt(pos);
                    pos++;
                  } else {
                    var result7 = null;
                    if (reportMatchFailures) {
                      matchFailed("[^\"]");
                    }
                  }
                  if (result7 !== null) {
                    var result6 = result7;
                  } else {
                    var result6 = null;;
                  };
                }
                if (result6 !== null) {
                  var result3 = [result4, result5, result6];
                } else {
                  var result3 = null;
                  pos = savedPos0;
                }
              } else {
                var result3 = null;
                pos = savedPos0;
              }
            } else {
              var result3 = null;
              pos = savedPos0;
            }
            var result2 = result3 !== null
              ? (function(c) {return c})(result3[2])
              : null;
          }
        } else {
          var result1 = null;
        }
        var result0 = result1 !== null
          ? (function(b) { return b.join('') })(result1)
          : null;
        reportMatchFailures = savedReportMatchFailures;
        if (reportMatchFailures && result0 === null) {
          matchFailed("literal");
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_esc() {
        var cacheKey = "esc" + '@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        if (input.substr(pos, 2) === "\\\"") {
          var result1 = "\\\"";
          pos += 2;
        } else {
          var result1 = null;
          if (reportMatchFailures) {
            matchFailed("\"\\\\\\\"\"");
          }
        }
        var result0 = result1 !== null
          ? (function() { return '"' })()
          : null;
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_comment() {
        var cacheKey = "comment" + '@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        var savedReportMatchFailures = reportMatchFailures;
        reportMatchFailures = false;
        var savedPos0 = pos;
        if (input.substr(pos, 2) === "{!") {
          var result2 = "{!";
          pos += 2;
        } else {
          var result2 = null;
          if (reportMatchFailures) {
            matchFailed("\"{!\"");
          }
        }
        if (result2 !== null) {
          var result3 = [];
          var savedPos1 = pos;
          var savedPos2 = pos;
          var savedReportMatchFailuresVar0 = reportMatchFailures;
          reportMatchFailures = false;
          if (input.substr(pos, 2) === "!}") {
            var result9 = "!}";
            pos += 2;
          } else {
            var result9 = null;
            if (reportMatchFailures) {
              matchFailed("\"!}\"");
            }
          }
          reportMatchFailures = savedReportMatchFailuresVar0;
          if (result9 === null) {
            var result7 = '';
          } else {
            var result7 = null;
            pos = savedPos2;
          }
          if (result7 !== null) {
            if (input.length > pos) {
              var result8 = input.charAt(pos);
              pos++;
            } else {
              var result8 = null;
              if (reportMatchFailures) {
                matchFailed('any character');
              }
            }
            if (result8 !== null) {
              var result6 = [result7, result8];
            } else {
              var result6 = null;
              pos = savedPos1;
            }
          } else {
            var result6 = null;
            pos = savedPos1;
          }
          var result5 = result6 !== null
            ? (function(c) {return c})(result6[1])
            : null;
          while (result5 !== null) {
            result3.push(result5);
            var savedPos1 = pos;
            var savedPos2 = pos;
            var savedReportMatchFailuresVar0 = reportMatchFailures;
            reportMatchFailures = false;
            if (input.substr(pos, 2) === "!}") {
              var result9 = "!}";
              pos += 2;
            } else {
              var result9 = null;
              if (reportMatchFailures) {
                matchFailed("\"!}\"");
              }
            }
            reportMatchFailures = savedReportMatchFailuresVar0;
            if (result9 === null) {
              var result7 = '';
            } else {
              var result7 = null;
              pos = savedPos2;
            }
            if (result7 !== null) {
              if (input.length > pos) {
                var result8 = input.charAt(pos);
                pos++;
              } else {
                var result8 = null;
                if (reportMatchFailures) {
                  matchFailed('any character');
                }
              }
              if (result8 !== null) {
                var result6 = [result7, result8];
              } else {
                var result6 = null;
                pos = savedPos1;
              }
            } else {
              var result6 = null;
              pos = savedPos1;
            }
            var result5 = result6 !== null
              ? (function(c) {return c})(result6[1])
              : null;
          }
          if (result3 !== null) {
            if (input.substr(pos, 2) === "!}") {
              var result4 = "!}";
              pos += 2;
            } else {
              var result4 = null;
              if (reportMatchFailures) {
                matchFailed("\"!}\"");
              }
            }
            if (result4 !== null) {
              var result1 = [result2, result3, result4];
            } else {
              var result1 = null;
              pos = savedPos0;
            }
          } else {
            var result1 = null;
            pos = savedPos0;
          }
        } else {
          var result1 = null;
          pos = savedPos0;
        }
        var result0 = result1 !== null
          ? (function(c) { return ["comment", c.join('')] })(result1[1])
          : null;
        reportMatchFailures = savedReportMatchFailures;
        if (reportMatchFailures && result0 === null) {
          matchFailed("comment");
        }
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_tag() {
        var cacheKey = "tag" + '@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var result3 = parse_ld();
        if (result3 !== null) {
          if (input.substr(pos).match(/^[#?^><+%:@\/~%]/) !== null) {
            var result4 = input.charAt(pos);
            pos++;
          } else {
            var result4 = null;
            if (reportMatchFailures) {
              matchFailed("[#?^><+%:@\\/~%]");
            }
          }
          if (result4 !== null) {
            var savedPos1 = pos;
            var savedPos3 = pos;
            var savedReportMatchFailuresVar1 = reportMatchFailures;
            reportMatchFailures = false;
            var result12 = parse_rd();
            reportMatchFailures = savedReportMatchFailuresVar1;
            if (result12 === null) {
              var result8 = '';
            } else {
              var result8 = null;
              pos = savedPos3;
            }
            if (result8 !== null) {
              var savedPos2 = pos;
              var savedReportMatchFailuresVar0 = reportMatchFailures;
              reportMatchFailures = false;
              var result11 = parse_eol();
              reportMatchFailures = savedReportMatchFailuresVar0;
              if (result11 === null) {
                var result9 = '';
              } else {
                var result9 = null;
                pos = savedPos2;
              }
              if (result9 !== null) {
                if (input.length > pos) {
                  var result10 = input.charAt(pos);
                  pos++;
                } else {
                  var result10 = null;
                  if (reportMatchFailures) {
                    matchFailed('any character');
                  }
                }
                if (result10 !== null) {
                  var result7 = [result8, result9, result10];
                } else {
                  var result7 = null;
                  pos = savedPos1;
                }
              } else {
                var result7 = null;
                pos = savedPos1;
              }
            } else {
              var result7 = null;
              pos = savedPos1;
            }
            if (result7 !== null) {
              var result5 = [];
              while (result7 !== null) {
                result5.push(result7);
                var savedPos1 = pos;
                var savedPos3 = pos;
                var savedReportMatchFailuresVar1 = reportMatchFailures;
                reportMatchFailures = false;
                var result12 = parse_rd();
                reportMatchFailures = savedReportMatchFailuresVar1;
                if (result12 === null) {
                  var result8 = '';
                } else {
                  var result8 = null;
                  pos = savedPos3;
                }
                if (result8 !== null) {
                  var savedPos2 = pos;
                  var savedReportMatchFailuresVar0 = reportMatchFailures;
                  reportMatchFailures = false;
                  var result11 = parse_eol();
                  reportMatchFailures = savedReportMatchFailuresVar0;
                  if (result11 === null) {
                    var result9 = '';
                  } else {
                    var result9 = null;
                    pos = savedPos2;
                  }
                  if (result9 !== null) {
                    if (input.length > pos) {
                      var result10 = input.charAt(pos);
                      pos++;
                    } else {
                      var result10 = null;
                      if (reportMatchFailures) {
                        matchFailed('any character');
                      }
                    }
                    if (result10 !== null) {
                      var result7 = [result8, result9, result10];
                    } else {
                      var result7 = null;
                      pos = savedPos1;
                    }
                  } else {
                    var result7 = null;
                    pos = savedPos1;
                  }
                } else {
                  var result7 = null;
                  pos = savedPos1;
                }
              }
            } else {
              var result5 = null;
            }
            if (result5 !== null) {
              var result6 = parse_rd();
              if (result6 !== null) {
                var result2 = [result3, result4, result5, result6];
              } else {
                var result2 = null;
                pos = savedPos0;
              }
            } else {
              var result2 = null;
              pos = savedPos0;
            }
          } else {
            var result2 = null;
            pos = savedPos0;
          }
        } else {
          var result2 = null;
          pos = savedPos0;
        }
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result1 = parse_reference();
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_ld() {
        var cacheKey = "ld" + '@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        if (input.substr(pos, 1) === "{") {
          var result0 = "{";
          pos += 1;
        } else {
          var result0 = null;
          if (reportMatchFailures) {
            matchFailed("\"{\"");
          }
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_rd() {
        var cacheKey = "rd" + '@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        if (input.substr(pos, 1) === "}") {
          var result0 = "}";
          pos += 1;
        } else {
          var result0 = null;
          if (reportMatchFailures) {
            matchFailed("\"}\"");
          }
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_eol() {
        var cacheKey = "eol" + '@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        if (input.substr(pos, 1) === "\n") {
          var result5 = "\n";
          pos += 1;
        } else {
          var result5 = null;
          if (reportMatchFailures) {
            matchFailed("\"\\n\"");
          }
        }
        if (result5 !== null) {
          var result0 = result5;
        } else {
          if (input.substr(pos, 2) === "\r\n") {
            var result4 = "\r\n";
            pos += 2;
          } else {
            var result4 = null;
            if (reportMatchFailures) {
              matchFailed("\"\\r\\n\"");
            }
          }
          if (result4 !== null) {
            var result0 = result4;
          } else {
            if (input.substr(pos, 1) === "\r") {
              var result3 = "\r";
              pos += 1;
            } else {
              var result3 = null;
              if (reportMatchFailures) {
                matchFailed("\"\\r\"");
              }
            }
            if (result3 !== null) {
              var result0 = result3;
            } else {
              if (input.substr(pos, 1) === "\u2028") {
                var result2 = "\u2028";
                pos += 1;
              } else {
                var result2 = null;
                if (reportMatchFailures) {
                  matchFailed("\"\\u2028\"");
                }
              }
              if (result2 !== null) {
                var result0 = result2;
              } else {
                if (input.substr(pos, 1) === "\u2029") {
                  var result1 = "\u2029";
                  pos += 1;
                } else {
                  var result1 = null;
                  if (reportMatchFailures) {
                    matchFailed("\"\\u2029\"");
                  }
                }
                if (result1 !== null) {
                  var result0 = result1;
                } else {
                  var result0 = null;;
                };
              };
            };
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_ws() {
        var cacheKey = "ws" + '@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        if (input.substr(pos).match(/^[	 \xA0\uFEFF]/) !== null) {
          var result0 = input.charAt(pos);
          pos++;
        } else {
          var result0 = null;
          if (reportMatchFailures) {
            matchFailed("[	 \\xA0\\uFEFF]");
          }
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function buildErrorMessage() {
        function buildExpected(failuresExpected) {
          failuresExpected.sort();
          
          var lastFailure = null;
          var failuresExpectedUnique = [];
          for (var i = 0; i < failuresExpected.length; i++) {
            if (failuresExpected[i] !== lastFailure) {
              failuresExpectedUnique.push(failuresExpected[i]);
              lastFailure = failuresExpected[i];
            }
          }
          
          switch (failuresExpectedUnique.length) {
            case 0:
              return 'end of input';
            case 1:
              return failuresExpectedUnique[0];
            default:
              return failuresExpectedUnique.slice(0, failuresExpectedUnique.length - 1).join(', ')
                + ' or '
                + failuresExpectedUnique[failuresExpectedUnique.length - 1];
          }
        }
        
        var expected = buildExpected(rightmostMatchFailuresExpected);
        var actualPos = Math.max(pos, rightmostMatchFailuresPos);
        var actual = actualPos < input.length
          ? quote(input.charAt(actualPos))
          : 'end of input';
        
        return 'Expected ' + expected + ' but ' + actual + ' found.';
      }
      
      function computeErrorPosition() {
        /*
         * The first idea was to use |String.split| to break the input up to the
         * error position along newlines and derive the line and column from
         * there. However IE's |split| implementation is so broken that it was
         * enough to prevent it.
         */
        
        var line = 1;
        var column = 1;
        var seenCR = false;
        
        for (var i = 0; i <  rightmostMatchFailuresPos; i++) {
          var ch = input.charAt(i);
          if (ch === '\n') {
            if (!seenCR) { line++; }
            column = 1;
            seenCR = false;
          } else if (ch === '\r' | ch === '\u2028' || ch === '\u2029') {
            line++;
            column = 1;
            seenCR = true;
          } else {
            column++;
            seenCR = false;
          }
        }
        
        return { line: line, column: column };
      }
      
      
      
    function wrap(node, ck) {
      
      node['text'] = input.substring(ck.split('@')[1], pos);
      
      return node;
      
    }
      
  
      
      var result = parse_body();
      
      /*
       * The parser is now in one of the following three states:
       *
       * 1. The parser successfully parsed the whole input.
       *
       *    - |result !== null|
       *    - |pos === input.length|
       *    - |rightmostMatchFailuresExpected| may or may not contain something
       *
       * 2. The parser successfully parsed only a part of the input.
       *
       *    - |result !== null|
       *    - |pos < input.length|
       *    - |rightmostMatchFailuresExpected| may or may not contain something
       *
       * 3. The parser did not successfully parse any part of the input.
       *
       *   - |result === null|
       *   - |pos === 0|
       *   - |rightmostMatchFailuresExpected| contains at least one failure
       *
       * All code following this comment (including called functions) must
       * handle these states.
       */
      if (result === null || pos !== input.length) {
        var errorPosition = computeErrorPosition();
        throw new SyntaxError(
          buildErrorMessage(),
          errorPosition.line,
          errorPosition.column
        );
      }
      
      return result;
    },
    
    /* Returns the parser source code. */
    toSource: function() { return this._source; }
  };
  
  /* Thrown when a parser encounters a syntax error. */
  
  result.SyntaxError = function(message, line, column) {
    this.name = 'SyntaxError';
    this.message = message;
    this.line = line;
    this.column = column;
  };
  
  result.SyntaxError.prototype = Error.prototype;
  
  return result;
})();

dust.parse = parser.parse;

})(typeof exports !== 'undefined' ? exports : window.dust);