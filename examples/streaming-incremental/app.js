var fs = require('fs'),
    path = require('path'),
    express = require('express'),
    dust = require('dustjs-linkedin'),
    q = require('q');

// Define a custom `onLoad` function to tell Dust how to load templates
dust.onLoad = function(tmpl, cb) {
  fs.readFile(path.join('./views', path.relative('/', path.resolve('/', tmpl + '.dust'))),
              { encoding: 'utf8' }, cb);
};

var app = express();

var position;
var context = {
  wait: function(chunk, context, bodies, params) {
    var delayMilliseconds = parseInt(params.delay, 10) * 1000;
    // Returning a Promise-- Dust will wait for the promise to resolve
    var promise = q(position++).delay(delayMilliseconds);
    promise.then(function(position) {
      console.log('Rendering', params.name, 'which started in position', position);
    });
    return promise;
  }
};

app.get('/', function (req, res) {
  dust.render('index', {}, function(err, out) {
    res.send(out);
  });
});

app.use(function(req, res, next) {
  console.log('\n\nBeginning the render of', req.path);
  console.log('Read hello.dust to see the block names and the order in which they appear.');
  position = 1;
  next();
});

app.get('/streaming', function(req, res) {
  dust.stream('hello', context).pipe(res)
    .on('end', function() {
      console.log('Done!');
    });
});

app.get('/rendering', function(req, res) {
  dust.render('hello', context, function(err, out) {
    res.send(out);
    console.log('Done!');
  });
});

app.listen(3000, function () {
  console.log('Using dust version', dust.version);
  console.log('Visit http://localhost:3000');
});
