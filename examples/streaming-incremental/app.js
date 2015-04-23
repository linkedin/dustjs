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

app.get('/', function (req, res) {
  dust.render('index', {}, function(err, out) {
    res.send(out);
  });
});

app.use(function(req, res, next) {
  console.log('\n\nBeginning the render of', req.path);
  next();
});

app.get('/streaming', function(req, res) {
  position = 1;
  dust.stream('hello', {
    'wait': function(chunk, context, bodies, params) {
      var delayMilliseconds = parseInt(params.delay, 10) * 1000;
      // Returning a Promise-- Dust will wait for the promise to resolve
      return q(position++).delay(delayMilliseconds)
              .then(function(position) {
                console.log('Rendering', params.name, 'which started in position', position);
              });
    }
  }).pipe(res)
    .on('end', function() {
      console.log('Done!');
    });
});

app.get('/rendering', function(req, res) {
  position = 1;
  dust.render('hello', {
    'wait': function(chunk, context, bodies, params) {
      var delayMilliseconds = parseInt(params.delay, 10) * 1000;
      // Returning a Promise-- Dust will wait for the promise to resolve
      return q(position++).delay(delayMilliseconds)
              .then(function(position) {
                console.log('Rendering', params.name, 'which started in position', position);
              });
    }
  }, function(err, out) {
    console.log('Done!');
    res.send(out);
  });
});

app.listen(3000, function () {
  console.log('Using dust version', dust.version);
  console.log('Visit http://localhost:3000');
});
