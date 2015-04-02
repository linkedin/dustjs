/*global dust*/
var isRhino = typeof isRhino !== 'undefined';
describe ('Render', function() {
  for (var index = 0; index < coreTests.length; index++) {
    for (var i = 0; i < coreTests[index].tests.length; i++) {
      var test = coreTests[index].tests[i];
      if (!isRhino || !test.disabled_in_rhino) {
        it (test.message, render(test));
      }
    }
  }
});
describe ('Stream', function() {
  for (var index = 0; index < coreTests.length; index++) {
    for (var i = 0; i < coreTests[index].tests.length; i++) {
      var test = coreTests[index].tests[i];
      if (!isRhino || !test.disabled_in_rhino) {
        it (test.message, stream(test));
      }
    }
  }
});
describe ('Pipe', function() {
  for (var index = 0; index < coreTests.length; index++) {
    for (var i = 0; i < coreTests[index].tests.length; i++) {
      var test = coreTests[index].tests[i];
      if (!isRhino || !test.disabled_in_rhino) {
        it (test.message, pipe(test));
      }
    }
  }
});

function prepare(test) {
  dust.config = extend({ whitespace: false, amd: false, cache: true }, test.config);
  dust.loadSource(dust.compile(test.source, test.name));
  context = test.context;
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

// Absorb all logs into a log queue for testing purposes
var dustLog = dust.log;
dust.logQueue = [];
dust.log = function(msg, type) {
  if(msg instanceof Error) {
    msg = msg.message;
  }
  dust.logQueue.push({ message: msg, type: type });
  dustLog.call(this, msg, type);
};

function extend(target, donor) {
  donor = donor || {};
  for(var prop in donor) {
    target[prop] = donor[prop];
  }
  return target;
}

function render(test) {
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
      var ctx = prepare(test);
      dust.render(test.name, ctx, check);
    } catch(err) {
      check(err);
    }
  };
}

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

function stream(test) {
  return function(done) {
    var result = { output: '' };
    var check = checkStream(done);
    var ctx;

    try {
      ctx = prepare(test);
      dust.stream(test.name, ctx)
      .on('data', function(data) { result.output += data; })
      .on('end', function() { check(test, result); })
      .on('error', function(err) { result.error = err.message || err; });
    } catch(err) {
      check(test, { error: err.message || err });
    }
  }
};

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

function pipe(test) {
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
    }
  }

  return function(done) {
    try {
      var ctx = prepare(test);
      dust.stream(test.name, ctx)
          .pipe(new WritableStream(checkPipe(test, done)))
          .pipe(new WritableStream(checkPipe(test, done)));
    } catch(err) {
      expect(err.message).toContain(test.error);
      done();
    }
  }
};
