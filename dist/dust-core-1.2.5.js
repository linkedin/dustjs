//
// Dust - Asynchronous Templating v1.2.5
// http://akdubya.github.com/dustjs
//
// Copyright (c) 2010, Aleksander Williams
// Released under the MIT License.
//

var dust = {};

function getGlobal(){
  return (function(){
    return this.dust;
  }).call(null);
}

(function(dust) {

if(!dust) {
  if(window.console && window.console.error) {
    window.console.error('dust is not defined');
  }
  return;
}

dust.logger = {
  // set the 'level' in the host environment equal to or more than the level of error you want to display.
  // set 'syncronous' in the host environment to true if you want to manually print out errors in a batch using dust.logErrors()
  // set 'forceLevel' in the host environment to an error level in order to only show errors of that level.
  DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, level: 4, synchronous: false,

  methodMap: {0: 'debug', 1: 'info', 2: 'warn', 3: 'error'},

  errorsList: [],

  // can be overridden in the host environment
  // log an error based on the level passed in and the current level set on this object
  log: function(level, obj) {
    if (dust.logger.level <= level) {
      if(dust.logger.forceLevel === undefined || dust.logger.forceLevel === level) {
        var method = dust.logger.methodMap[level];
        if (typeof window.console !== 'undefined' && window.console[method]) {
          window.console[method].call(window.console, obj);
        }
      }
    }
  },

  addError: function(level, obj) {
    dust.logger.errorsList.push({level: level, obj:obj});
  },

  logErrors: function() {
    var i, len;
    if(console.group) {
      console.group('dust errors');
    }
    for(i=0,len=dust.logger.errorsList.length; i<len; i++) {
      dust.logger.log(dust.logger.errorsList[i].level, dust.logger.errorsList[i].obj);
    }
    if(console.groupEnd) {
      console.groupEnd();
    }
  }
};

// if dust.logger.synchronous is set to true, only add the error instead of logging it.
dust.log = function(level, obj) { dust.logger.synchronous ? dust.logger.addError(level, obj) : dust.logger.log(level, obj); };

// use this to manually print out synchronlously printed errors.
dust.logErrors = function() { dust.logger.logErrors(); };

dust.helpers = {};

dust.cache = {};

dust.register = function(name, tmpl) {
  if (!name) {
    dust.log(2, 'template name is undefined');
    return;
  } 
  if(typeof tmpl !== 'function') {
    dust.log(2, 'template [' + name + '] cannot be resolved to a dust function');
  }
  dust.cache[name] = tmpl;
};

dust.render = function(name, context, callback) {
  var chunk = new Stub(callback).head,
      loadedChunk = dust.load(name, chunk, Context.wrap(context, name));
  // catch errors from dust.load
  if(loadedChunk.error && loadedChunk.error.message) {
    dust.log(2, loadedChunk.error.message);
  }
  loadedChunk.end();
};

dust.stream = function(name, context) {
  var stream = new Stream();
  dust.nextTick(function() {
    var loadedChunk = dust.load(name, stream.head, Context.wrap(context, name));
    // catch errors from dust.load
    if(loadedChunk.error && loadedChunk.error.message) {
      dust.log(2, loadedChunk.error.message);
    }
    loadedChunk.end();
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
      if(typeof tmpl === 'function') {
        tmpl(master.head, Context.wrap(context, name)).end();
      }
      else {
        dust.log(2, 'template [' + name + '] cannot be resolved to a dust function');
      }
    });
    return master;
  };
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

dust.prototype = Object.prototype;
if (Array.isArray) {
  dust.isArray = Array.isArray;
} else {
  dust.isArray = function(arr) {
    return dust.prototype.toString.call(arr) === "[object Array]";
  };
}

dust.nextTick = (function() {
  if (typeof process !== "undefined") {
    return process.nextTick;
  } else {
    return function(callback) {
      setTimeout(callback,0);
    };
  }
} )();

dust.isEmpty = function(value) {
  if (dust.isArray(value) && !value.length) return true;
  if (value === 0) return false;
  return (!value);
};

// apply the filter chain and return the output string
dust.filter = function(string, auto, filters) {
  if (filters) {
    for (var i=0, len=filters.length; i<len; i++) {
      var name = filters[i];
      if (name === "s") {
        auto = null;
        dust.log(0, 'using unescape filter on [' + string + ']');
      }
      else if (typeof dust.filters[name] === 'function') {
        string = dust.filters[name](string);
      }
      else {
        dust.log(2, 'invalid filter [' + name + ']');
      }
    }
  }
  // by default always apply the h filter, unless asked to unescape with |s
  if (auto) {
    string = dust.filters[auto](string);
  }
  return string;
};

dust.filters = {
  h: function(value) { return dust.escapeHtml(value); },
  j: function(value) { return dust.escapeJs(value); },
  u: encodeURI,
  uc: encodeURIComponent,
  js: function(value) { if (!JSON) { dust.log(2, 'JSON is undefined.  JSON stringify has not been used on [' + value + ']'); return value; } return JSON.stringify(value); },
  jp: function(value) { if (!JSON) { dust.log(2, 'JSON is undefined.  JSON parse has not been used on [' + value + ']'); return value; } return JSON.parse(value); }
};

function Context(stack, global, blocks) {
  this.stack  = stack;
  this.global = global;
  this.blocks = blocks;
}

dust.makeBase = function(global) {
  return new Context(new Stack(), global);
};

Context.wrap = function(context, name) {
  if (context instanceof Context) {
    return context;
  }
  var global= {};
  global.__template_name__ = name;
  return new Context(new Stack(context), global);
};

Context.prototype.get = function(key) {
  var ctx = this.stack, value;

  while(ctx) {
    if (ctx.isObject) {
      if(ctx.head) {
        value = ctx.head[key];
      }
      else {
        dust.log(2, 'context head is undefined for[' + key + ']');
      }
      if (!(value === undefined)) {
        return value;
      }
    }
    else {
      dust.log(0, 'current context is not an object.  Cannot find value for [{' + key + '}]');
    }
    dust.log(0, 'Looking for [{' + key + '}] up the context stack');
    ctx = ctx.tail;
  }
  dust.log(0, 'Looking for [{' + key + '}] in the globals');
  return this.global ? this.global[key] : undefined;
};

Context.prototype.getPath = function(cur, down) {
  var ctx = this.stack,
      len = down && dust.isArray(down) ? down.length : 0;

  if(!down) {
    dust.log(1, 'array parameter in getPath is not defined');
  }
  if(!dust.isArray(down)) {
    dust.log(1, 'array parameter in getPath is not an array');
  }

  if (cur && len === 0) return ctx.head;
  ctx = ctx.head;
  var i = 0;
  while(ctx && i < len) {
    ctx = ctx[down[i]];
    i++;
  }
  return ctx;
};

Context.prototype.push = function(head, idx, len) {
  var context = new Context(new Stack(head, this.stack, idx, len), this.global, this.blocks);
  if(context) {
    return context;
  }
  else {
    dust.log(2, 'Head [' + head + '] could not be resolved to a context');
    return {};
  }
};

Context.prototype.rebase = function(head) {
  var context = new Context(new Stack(head), this.global, this.blocks);
  if(context) {
    return context;
  }
  else {
    dust.log(2, 'Head [' + head + '] could not be resolved to a context');
    return {};
  }
};

Context.prototype.current = function() {
  return this.stack.head;
};

Context.prototype.getBlock = function(key, chk, ctx) {
  if (typeof key === "function") {
    key = key(chk, ctx).data.join("");
    chk.data = []; //ie7 perf
  }

  var blocks = this.blocks;

  if (!blocks) {
    dust.log(1, 'no blocks defined for function getBlock');
    return;
  }
  var len = blocks.length, fn;
  while (len--) {
    fn = blocks[len][key];
    if (fn) return fn;
  }
};

Context.prototype.shiftBlocks = function(locals) {
  var blocks = this.blocks,
      newBlocks;

  if (locals) {
    if (!blocks) {
      newBlocks = [locals];
    } else {
      newBlocks = blocks.concat([locals]);
    }
    return new Context(this.stack, this.global, newBlocks);
  }
  return this;
};

function Stack(head, tail, idx, len) {
  this.tail = tail;
  this.isObject = !dust.isArray(head) && head && typeof head === "object";
  if(head !== undefined && head !== null) {
    this.head = head;
  }
  else {
    dust.log(0, 'head was undefined. Defaulting to {}');
    this.head = {};
  }
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
      this.out += chunk.data.join(""); //ie7 perf
    } else if (chunk.error) {
      this.callback(chunk.error);
      dust.log(2, 'chunk error [' + chunk.error + '] thrown. Setting flush function to empty function.');
      this.flush = function() {};
      return;
    } else {
      return;
    }
    chunk = chunk.next;
    this.head = chunk;
  }
  this.callback(null, this.out);
};

function Stream() {
  this.head = new Chunk(this);
}

Stream.prototype.flush = function() {
  var chunk = this.head;

  while(chunk) {
    if (chunk.flushable) {
      this.emit('data', chunk.data.join("")); //ie7 perf
    } else if (chunk.error) {
      this.emit('error', chunk.error);
      dust.log(2, 'chunk error [' + chunk.error + '] thrown. Setting flush function to empty function.');
      this.flush = function() {};
      return;
    } else {
      return;
    }
    chunk = chunk.next;
    this.head = chunk;
  }
  this.emit('end');
};

Stream.prototype.emit = function(type, data) {
  if (!this.events) { 
    dust.log(1, 'no events to emit');
    return false;
  }
  var handler = this.events[type];
  if (!handler) {
    dust.log(2, 'Event type [' + type + '] does not exist');
    return false;
  }
  if (typeof handler == 'function') {
    handler(data);
  } else if (dust.isArray(handler)) {
    var listeners = handler.slice(0);
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i](data);
    }
  }
  else {
    dust.log(0, 'handler [' + handler + '] is not of a type that is handled by emit');
  }
};

Stream.prototype.on = function(type, callback) {
  if (!this.events) {
    this.events = {};
  }
  if (!this.events[type]) {
    dust.log(2, 'event type [' + type + '] does not exist. using just the specified callback.');
    if(callback) {
      this.events[type] = callback;
    } else {
      dust.log(2, 'callback for type [' + type + '] does not exist. listener not registered.');
    }
  } else if(typeof this.events[type] === 'function') {
    this.events[type] = [this.events[type], callback];
  } else {
    this.events[type].push(callback);
  }
  return this;
};

Stream.prototype.pipe = function(stream) {
  this.on("data", function(data) {
    stream.write(data, "utf8");
  }).on("end", function() {
    stream.end();
  }).on("error", function(err) {
    stream.error(err);
  });
  return this;
};

function Chunk(root, next, taps) {
  this.root = root;
  this.next = next;
  this.data = []; //ie7 perf
  this.flushable = false;
  this.taps = taps;
}

Chunk.prototype.write = function(data) {
  var taps  = this.taps;

  if (taps) {
    data = taps.go(data);
  }
  this.data.push(data);
  return this;
};

Chunk.prototype.end = function(data) {
  if (data) {
    this.write(data);
  }
  this.flushable = true;
  this.root.flush();
  return this;
};

Chunk.prototype.map = function(callback) {
  var cursor = new Chunk(this.root, this.next, this.taps),
      branch = new Chunk(this.root, cursor, this.taps);

  this.next = branch;
  this.flushable = true;
  callback(branch);
  return cursor;
};

Chunk.prototype.tap = function(tap) {
  var taps = this.taps;

  if (taps) {
    this.taps = taps.push(tap);
  } else {
    this.taps = new Tap(tap);
  }
  return this;
};

Chunk.prototype.untap = function() {
  this.taps = this.taps.tail;
  return this;
};

Chunk.prototype.render = function(body, context) {
  return body(this, context);
};

Chunk.prototype.reference = function(elem, context, auto, filters) {
  if (typeof elem === "function") {
    elem.isFunction = true;
    // Changed the function calling to use apply with the current context to make sure 
    // that "this" is wat we expect it to be inside the function
    elem = elem.apply(context.current(), [this, context, null, {auto: auto, filters: filters}]);
    if (elem instanceof Chunk) {
      return elem;
    }
  }
  if (!dust.isEmpty(elem)) {
    return this.write(dust.filter(elem, auto, filters));
  } else {
    dust.log(1, 'reference for element [' + elem + '] was not found. defaulting to chunk.');
    return this;
  }
};

Chunk.prototype.section = function(elem, context, bodies, params) {
  // anonymous functions
  if (typeof elem === "function") {
    elem = elem.apply(context.current(), [this, context, bodies, params]);
    // functions that return chunks are assumed to have handled the body and/or have modified the chunk
    // use that return value as the current chunk and go to the next method in the chain
    if (elem instanceof Chunk) {
      return elem;
    }
  }
  var body = bodies.block,
      skip = bodies['else'];

  // a.k.a Inline parameters in the Dust documentations
  if (params) {
    context = context.push(params);
  }

  /*
  Dust's default behavior is to enumerate over the array elem, passing each object in the array to the block.
  When elem resolves to a value or object instead of an array, Dust sets the current context to the value 
  and renders the block one time.
  */
  //non empty array is truthy, empty array is falsy
  if (dust.isArray(elem)) {
     if (body) {
      var len = elem.length, chunk = this;
      if (len > 0) {
        // any custom helper can blow up the stack 
        // and store a flattened context, guard defensively
        context.stack.head['$len'] = len;
        for (var i=0; i<len; i++) {
          if(context.stack.head) {
           context.stack.head['$idx'] = i;
          }
          chunk = body(chunk, context.push(elem[i], i, len));
        }
        if(context.stack.head) {
         context.stack.head['$idx'] = undefined;
         context.stack.head['$len'] = undefined;
        }
        return chunk;
      } 
      else if (skip) {
         return skip(this, context);
      }
     }
   }
   // true is truthy but does not change context
   else if (elem  === true) {
     if (body) { 
        return body(this, context);
     }
   }
   // everything that evaluates to true are truthy ( e.g. Non-empty strings and Empty objects are truthy. )
   // zero is truthy
   // for anonymous functions that did not returns a chunk, truthiness is evaluated based on the return value
   //
   else if (elem || elem === 0) {
     if (body) return body(this, context.push(elem));
   // nonexistent, scalar false value, scalar empty string, null,
   // undefined are all falsy
  } else if (skip) {
     return skip(this, context);
  }
  dust.log(2, 'can not handle the element [' + elem + '] given for the section tag');  
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
  dust.log(0, 'not rendering body or skip');
  return this;
};

Chunk.prototype.notexists = function(elem, context, bodies) {
  var body = bodies.block,
      skip = bodies['else'];

  if (dust.isEmpty(elem)) {
    if (body) return body(this, context);
  } else if (skip) {
    return skip(this, context);
  }
  dust.log(0, 'not rendering body or skip');
  return this;
};

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

Chunk.prototype.partial = function(elem, context, params) {
  var partialContext;
  if (params){
    //put the params context second to match what section does. {.} matches the current context without parameters
    // start with an empty context
    partialContext = dust.makeBase(context.global);
    partialContext.blocks = context.blocks;
    if (context.stack && context.stack.tail){
      // grab the stack(tail) off of the previous context if we have it
      partialContext.stack = context.stack.tail;
    }
    //put params on
    partialContext = partialContext.push(params);
    //reattach the head
    partialContext = partialContext.push(context.stack.head);
  } else {
    partialContext = context;
  }
  if (typeof elem === "function") {
    return this.capture(elem, partialContext, function(name, chunk) {
      dust.load(name, chunk, partialContext).end();
    });
  }
  return dust.load(elem, this, partialContext);
};

Chunk.prototype.helper = function(name, context, bodies, params) {
  // handle invalid helpers, similar to invalid filters
  if( dust.helpers[name]){
   return dust.helpers[name](this, context, bodies, params);
  } else {
    dust.log(3, 'invalid helper [' + name + ']');
    return this;
  }
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

var HCHARS = new RegExp(/[&<>\"\']/),
    AMP    = /&/g,
    LT     = /</g,
    GT     = />/g,
    QUOT   = /\"/g,
    SQUOT  = /\'/g;

dust.escapeHtml = function(s) {
  if (typeof s === "string") {
    if (!HCHARS.test(s)) {
      return s;
    }
    return s.replace(AMP,'&amp;').replace(LT,'&lt;').replace(GT,'&gt;').replace(QUOT,'&quot;').replace(SQUOT, '&#39;');
  }
  return s;
};

var BS = /\\/g,
    FS = /\//g,
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
      .replace(FS, '\\/')
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
