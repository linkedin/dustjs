/*jshint rhino:true*/
/*global jasmineRequire*/
//set up functions missing in Rhino
(function () {
	var timers = [];

	window.setTimeout = function(fn, time){
		var num;
		return num = setInterval(function(){
			fn();
			clearInterval(num);
		}, time);
	};

	window.setInterval = function(fn, time){
		var num = timers.length;

		timers[num] = new java.lang.Thread(new java.lang.Runnable({
			run: function(){
				while (true){
					java.lang.Thread.currentThread().sleep(time);
					fn();
				}
			}
		}));

		timers[num].start();

		return num;
	};

	window.clearInterval = function(num){
		if ( timers[num] ) {
			timers[num].stop();
			delete timers[num];
		}
	};

    window.clearTimeout = window.clearInterval;

})();

// set up Jasmine

var jasmine = jasmineRequire.core(jasmineRequire);

var env = jasmine.getEnv();

var jasmineInterface = {
  describe: function(description, specDefinitions) {
    return env.describe(description, specDefinitions);
  },

  xdescribe: function(description, specDefinitions) {
    return env.xdescribe(description, specDefinitions);
  },

  it: function(desc, func) {
    return env.it(desc, func);
  },

  xit: function(desc, func) {
    return env.xit(desc, func);
  },

  beforeEach: function(beforeEachFunction) {
    return env.beforeEach(beforeEachFunction);
  },

  afterEach: function(afterEachFunction) {
    return env.afterEach(afterEachFunction);
  },

  expect: function(actual) {
    return env.expect(actual);
  },

  pending: function() {
    return env.pending();
  },

  spyOn: function(obj, methodName) {
    return env.spyOn(obj, methodName);
  },

  jsApiReporter: new jasmine.JsApiReporter({
    timer: new jasmine.Timer()
  })
};

for(var prop in jasmineInterface) {
  this[prop] = jasmineInterface[prop];
}

var failedSpecs = [],
    passedSpecs = [],
    reporter = {};

reporter.specDone = function(spec) {
  if(spec.status === 'passed') {
    java.lang.System.out.print('.');
    passedSpecs.push(spec);
  } else {
    java.lang.System.out.print('X');
    failedSpecs.push(spec);
  }
};

reporter.jasmineDone = function() {
  print('\n');
  for(var i = 0; i < failedSpecs.length; i++) {
    print('\tFailed: ' + failedSpecs[i].description);
  }
  print('Passed ' + passedSpecs.length + ' Failed ' + failedSpecs.length + '\n');

  if(failedSpecs.length > 0) {
    java.lang.System.exit(1);
  } else {
		quit();
	}
};

env.addReporter(reporter);
