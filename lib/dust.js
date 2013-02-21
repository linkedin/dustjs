var dust = {};

function getGlobal(){
  return (function(){
    return this.dust;
  }).call(null);
}

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

if (Array.isArray) {
  dust.isArray = Array.isArray;
} else {
  dust.isArray = function(arr) {
    return Object.prototype.toString.call(arr) == "[object Array]";
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
      }
      // fail silently for invalid filters
      else if (typeof dust.filters[name] === 'function') {
        string = dust.filters[name](string);
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
  u: encodeURI, // useless
  url: function(value) { return dust.sanitizeURL(value); },
  uc: function(value) { return dust.encodeURIComponent(value); },
  js: function(value) { return dust.JSONstringify(value); },
  jp: function(value) { if (typeof(JSON) === 'undefined' || typeof(JSON.parse) === 'undefined') { throw new Error("JSON not found"); } return JSON.parse(value); } // useless
};

function Context(stack, global, blocks) {
  this.stack  = stack;
  this.global = global;
  this.blocks = blocks;
}

dust.makeBase = function(global) {
  return new Context(new Stack(), global);
};

Context.wrap = function(context) {
  if (context instanceof Context) {
    return context;
  }
  return new Context(new Stack(context));
};

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

Context.prototype.getBlock = function(key, chk, ctx) {
  if (typeof key === "function") {
    key = key(chk, ctx).data;
    chk.data = "";
  }

  var blocks = this.blocks;

  if (!blocks) return;
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
};

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
};

Stream.prototype.emit = function(type, data) {
  if (!this.events) return false;
  var handler = this.events[type];
  if (!handler) return false;
  if (typeof handler == 'function') {
    handler(data);
  } else {
    var listeners = handler.slice(0);
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i](data);
    }
  }
};

Stream.prototype.on = function(type, callback) {
  if (!this.events) {
    this.events = {};
  }
  if (!this.events[type]) {
    this.events[type] = callback;
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
        if(context.stack.head) {
         context.stack.head['$len'] = len;
        }
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
};

Chunk.prototype.notexists = function(elem, context, bodies) {
  var body = bodies.block,
      skip = bodies['else'];

  if (dust.isEmpty(elem)) {
    if (body) return body(this, context);
  } else if (skip) {
    return skip(this, context);
  }
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

// This function checks protocol of URL and if it's not safe adds ./ before like ./jAvascript:alert(1)
// don't use HTML encoded URLs here
// {website|h|url} is wrong
// you can use it as <a href="{website|url}">website</a>
// or <script>var url = '{website|url|j|s}'; a.href = x;</script>
dust.sanitizeURL = (function(undefined) {
	// symbols which will be replaced or encoded to URI
	var re = /[\u0000-\u0020\u001f`'"<>()\[\]{}\\,]/g;
	var index = {
		'\t': '%09',
		'\r': '%0D',
		'\n': '%0A',
		'\u001f': '\ufffd'
	};
	
	// replace all control chars with safe one
	for (var i = 0; i < 0x20; i++) {
		var c = String.fromCharCode(i);
		if (index[c] === undefined) {
			index[c] = '\ufffd';
		}
	}
	
	for (var i = 0x20; i < 128; i++) {
		var c = String.fromCharCode(i);
		if (index[c] === undefined && c.match(re)) {
			index[c] = escape(c);
		}
	}
	
	return function(url) {
		if (url === null || url === undefined) {
			return null;
		}
		url = url.trim()
			.replace(re, function(c) {
				return index[c]
			})
			.replace(/[\s\u2028\u2029]/g, '%20')		// all custom spaces must be URI encoded
			.replace(/&#/g, '#')				// in normals URLs this situation possible only for not URI encoded HTML entities http://w3.org/test?a=b&#x3c;
			.replace(/(&[a-zA-Z]+);/g, '$1%3B')		// we encode semi-colon if it looks like HTML entity  javascript&NewLine;&Tab;&colon;&apos; but not &quot&lt&gt&amp
			.replace(/^([\s\S]{0,14});/g, '$1%3B')		// https://;URL=javascript:alert(1)
			.replace(/(&[quolgQUOLG]{1,3})t/g, '$1%74')	// &qUot, &lt, &Gt we encode t and T if it looks like HTML entity, because some of them can be used without semi-colon
			.replace(/(&[quolgQUOLG]{1,3})T/g, '$1%54')	// &quoT, &LT, &gT
			.replace(/%(?=[^A-Fa-f0-9]|[A-Fa-f0-9][^A-Fa-f0-9]|[\s\S]?$)/g, '%25'); // encode all not correct URI encoded strings like %%1%g1
	
		var lc = url.toLowerCase();
		// if URL starts not from http, mailto, ftp and #hash, ?search, //UNC, /root, ../relative and have scheme:
		if (!/^(?:http|mailto|ftp|[#\/.?])/.test(lc) && /^[^?\/#:]+?:/.test(lc)) {
			// if URL starts from wrong scheme or have encoded entity
			if (/^(?:about|cdl|dvd|local|mhtml|mk|ms-help|ms-its|tv|res|its|javascript|data|vbs|vbscript|feed|java|jar|file|[a-z]):/.test(lc) || !/^[a-z0-1\-_.]+?:/.test(lc)) {
				url = './' + url;
			}
		}
		
		return url;
	};
}());

dust.encodeURIComponent = function() {
	// compatible with OAuth signature calculation
	// http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Functions:encodeURIComponent
	return encodeURIComponent.apply(this, arguments).replace(/[!'()]/g, escape).replace(/\*/g, '%2A');
};

// TODO: use config for this or localStorage value dust.escapeHtml(dust.escapeJs("O'Connor")) is O\&#39;Connor
dust.backwardCompatibility = 2; // unittests compatible
// localStorage.setItem('dust.backwardCompatibility', 0); // all important chars encoded
// localStorage.setItem('dust.backwardCompatibility', 1); // compatible with <script>var x = '{value|j}'</script>
// localStorage.setItem('dust.backwardCompatibility', 2); // unit tests compatible (usual encoding, vulnerable)
if (typeof localStorage !== 'undefined' && localStorage.getItem('dust.backwardCompatibility') !== null) {
	dust.backwardCompatibility = parseInt(localStorage.getItem('dust.backwardCompatibility'), 10);
}

dust.escapeHtml = (function(backwardCompatibility, undefined) {
  
	var index = {
		'\t': '\t',
		'\r': '\r',
		'\n': '\n',
		'\u00a0': '&nbsp;',
		'<': '&lt;',
		'>': '&gt;',
		'&': '&amp;',
		'"': '&quot;',
		'\u007f': '&#xfffd;',
		'\u2028': '&#x2028;',
		'\u2029': '&#x2029;'
	};
	
	// replace all control chars with safe one
	for (var i = 0; i < 0x20; i++) {
		var c = String.fromCharCode(i);
		if (index[c] === undefined) {
			index[c] = '&#xfffd;';
		}
	}
	
	// this range of chars with will be replaced with HTML entities, if add symbol with code more than 127, check that it in index table
	var re = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u00a0<>'"`\\\[\]+\-=.:(){};,\/&\u007f\u2028\u2029]/g;
	
	// precache index
	for (var i = 0x20; i < 128; i++) {
		var c = String.fromCharCode(i);
		if (index[c] === undefined && c.match(re)) {
			index[c] = '&#' + i + ';'
		}
	}

	// TODO: remove it after default encoding for script context <script>var x = '{x|j}'</script> fixed
	if (backwardCompatibility) {
		index['\\'] = '\\';
		if (backwardCompatibility === 2) { // please fix unit tests!
			index['['] = '[';	
			index[']'] = ']';
			index['('] = '(';	
			index[')'] = ')';	
			index['/'] = '/';	
			index['.'] = '.';	
			index[','] = ',';	
		}
	}
	
	return function(s) {
		if (s === null || s === undefined) {
			return null;
		}
		var type = typeof s;
		if (type === 'number' || type === 'boolean') {
			return s + '';
		}
		return (s + '').replace(re, function(c) {
			return index[c];
		});
	}
}(dust.backwardCompatibility));

dust.escapeJs = (function(backwardCompatibility, undefined) {

	// {}[],:-+. can be outside of JSON strings
	// \u2028\u2029 can break JavaScript strings: eval('("\u2028")')
	var jsonRE = /[\/<>&%\u0000\u2028\u2029*()'=!?`#]/g; // chars additionaly encoded by JSON.stringify
	var jsRE = /[^a-z0-9_\u0080-\u2027\u202a-\uffff]/ig; // chars encoded by jsEncode
	// if you change any of jsonRE or jsRE, check that this char in index
	var index = {
	    "\t": "\\t",
	    "\n": "\\n",
	    "\r": "\\r",
	    "\u2028": "\\u2028",
	    "\u2029": "\\u2029"
	};
	
	// precache chars for jsRE
	// jsRE includes jsonRE
	for (var i = 0; i < 128; i++) {
		var c = String.fromCharCode(i);
		if (index[c] === undefined && c.match(jsRE)) {
			index[c] = '\\u' + ('000' + c.charCodeAt(0).toString(16)).slice(-4);
		}
	}

	// TODO: remove it after default encoding for script context <script>var x = '{x|j}'</script> fixed
	if (backwardCompatibility) {
		index['<'] = '<';
	//	index['\''] = '\\\''; // not compatible with JSON.parse
		index['"'] = '\\"';
		index['&'] = '&';
	}
	
	var jsEncode = function(s) {
		if (s === null || s === undefined) {
			return null;
		}
		var type = typeof s;
		if (type === 'number' || type === 'boolean') {
			return s + '';
		}
		return (s + '').replace(jsRE, function(c) {
			return index[c];
		});
	};

	// check that JSON.stringify is native
	if (typeof JSON !== 'undefined' && JSON.stringify && JSON.stringify('\\"\/<>&%\u0000\u2028\u2029*()\'=!?`#') === '"\\\\\\"/<>&%\\u0000\u2028\u2029*()\'=!?`#"') {
		var JSONstringify = JSON.stringify;
		jsEncode.JSONstringify = function() {
			return JSONstringify.apply(this, arguments).replace(jsonRE, function(c) {
				return index[c];
			});
		};
	}

	return jsEncode;
}(dust.backwardCompatibility));

if (typeof dust.escapeJs.JSONstringify === 'undefined') {
	if (typeof JSON === 'undefined' || typeof JSON.stringify === 'undefined') {
		dust.JSONstringify = function() { throw new Error("JSON.stringify not found"); }
	} else {
		// not native JSON.stringify
		dust.JSONstringify = function() {
			return JSON.stringify.apply(this, arguments);
		}
	}
} else {
	// JSON.stringify with additional encoding symbols like ()' etc.
	dust.JSONstringify = dust.escapeJs.JSONstringify;
}

})(dust);

if (typeof exports !== "undefined") {
  if (typeof process !== "undefined") {
      require('./server')(dust);
  }
  module.exports = dust;
}
