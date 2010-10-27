var uubench    = require('./uubench'),
    dust       = require('../lib/dust'),
    dustBench  = require('./suites/dust_suite').dustBench;

uubench.nextTick = process.nextTick;

var suite = new uubench.Suite({
  iterations: 10000,
  result: function(name, stats) {
    var opms = stats.iterations/stats.elapsed;
    console.log(pad(12, name + ": "), pad(5, Math.round(opms), true));
  }
});

function pad(amt, val, pre) {
  val = String(val);
  var len = amt - val.length, out = '';
  for (var i=0; i<len; i++) {
    out += ' ';
  }
  return pre ? out + val : val + out;
}

console.log("ops/ms");
console.log("------");

global.dust = dust;

for (var key in dustBench.benches) {
  dustBench(suite, key);
}

suite.run();