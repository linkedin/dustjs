var isRhino = typeof isRhino !== 'undefined';
(function (root, factory) {
  if (typeof exports === 'object') {
    require('./helpers/template.helper.js');
    var dust = require('../'),
        tests = require('./templates/all.js');
    factory(dust, tests);
  } else {
    factory(root.dust, root.coreTests);
  }
}(this, function(dust, tests) {
  /*jshint loopfunc:true*/
  var testers = {
    Render: render,
    Stream: stream,
    Pipe: pipe
  },
  dustLog = dust.log,
  suite, test,
  t, i, j;

  // Absorb all logs into a log queue for testing purposes
  dust.logQueue = [];
  dust.log = function(msg, type) {
    if(msg instanceof Error) {
      msg = msg.message;
    }
    dust.logQueue.push({ message: msg, type: type });
    dustLog.call(this, msg, type);
  };

  for(t in testers) {
    if(isRhino && t !== 'Render') { continue; }
    describe(t, function() {
      for(i = 0; i < tests.length; i++) {
        suite = tests[i];
        describe(suite.name, function() {
          for(j = 0; j < suite.tests.length; j++) {
            test = suite.tests[j];
            if (!isRhino || !test.disabled_in_rhino) {
              it(test.message, testers[t](test, dust));
            }
          }
        });
      }
    });
  }

}));

function prepare(test, dust) {
  dust.config = extend({ whitespace: false, amd: false, cache: true }, test.config);
  dust.loadSource(dust.compile(test.source, test.name));
  var context = test.context;
  if (test.base) {
     context = dust.makeBase(test.base).push(context);
  }
  return context;
}

function messageInLog(log, message, level) {
  var i, ret = false;
  log = log || [];
  for(i = 0; i < log.length; i++) {
    if(log[i].message.indexOf(message) > -1) {
      ret = (!level || log[i].level === level);
      break;
    }
  }
  return ret;
}

function extend(target, donor) {
  donor = donor || {};
  for(var prop in donor) {
    target[prop] = donor[prop];
  }
  return target;
}

function render(test, dust) {
  function checkRender(done) {
    return function(err, output) {
      if (test.error) {
        err = err.message || err;
        expect(err).toContain(test.error);
      } else {
        if(err) {
          expect(err.message).toBeNull();
        }
      }
      if (test.log) {
        expect(messageInLog(dust.logQueue, test.log)).toEqual(true);
      }
      if (typeof test.expected !== 'undefined') {
        expect(test.expected).toEqual(output);
      }
      done();
    };
  }

  return function(done) {
    var check = checkRender(done);
    try {
      var ctx = prepare(test, dust);
      dust.render(test.name, ctx, check);
    } catch(err) {
      check(err);
    }
  };
}

function stream(test, dust) {
  function checkStream(done) {
    return function(test, result) {
      if (test.error) {
        expect(result.error).toContain(test.error);
      } else {
        if(result.error) {
          expect(result.error).toBeNull();
        }
      }
      if (test.log) {
        expect(messageInLog(dust.logQueue, test.log)).toEqual(true);
      }
      if (typeof test.expected !== 'undefined') {
        expect(test.expected).toEqual(result.output);
      }
      done();
    };
  }

  return function(done) {
    var result = { output: '' };
    var check = checkStream(done, dust);
    var ctx;

    try {
      ctx = prepare(test, dust);
      dust.stream(test.name, ctx)
      .on('data', function(data) { result.output += data; })
      .on('end', function() { check(test, result); })
      .on('error', function(err) { result.error = err.message || err; });
    } catch(err) {
      check(test, { error: err.message || err });
    }
  };
}

function WritableStream(cb) {
  var _this = this;
  _this.data = '';

  function write(data) {
    _this.data += data;
  }

  function end() {
    cb({
      data: _this.data,
      error: _this.error ? _this.error.toString() : undefined
    });
  }

  function emit(e, data) {
    switch(e) {
      case 'pipe':
        data.on('error', function(err) {
          _this.error = err;
        });
      break;
    }
  }

  return {
    write: write,
    end: end,
    emit: emit
  };
}

function pipe(test, dust) {
  var calls = 0;

  function checkPipe(test, done) {
    return function(result) {
      calls++;
      if (test.error) {
        expect(result.error).toContain(test.error);
      } else {
        if(result.error) {
          expect(result.error).toBeNull();
        }
      }
      if (test.log) {
        expect(messageInLog(dust.logQueue, test.log)).toEqual(true);
      }
      if (typeof test.expected !== 'undefined') {
        expect(test.expected).toEqual(result.data);
      }
      if(calls === 2) {
        done();
      }
    };
  }

  return function(done) {
    try {
      var ctx = prepare(test, dust);
      dust.stream(test.name, ctx)
          .pipe(new WritableStream(checkPipe(test, done)))
          .pipe(new WritableStream(checkPipe(test, done)));
    } catch(err) {
      expect(err.message).toContain(test.error);
      done();
    }
  };
}
