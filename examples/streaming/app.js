var fs = require('fs'),
    path = require('path'),
    express = require('express'),
    request = require('request'),
    dust = require('dustjs-linkedin');

dust.config.whitespace = true;
dust.config.cache = false;

// Define a custom `onLoad` function to tell Dust how to load templates
dust.onLoad = function(tmpl, cb) {
  fs.readFile(path.join('./views', path.relative('/', path.resolve('/', tmpl + '.dust'))),
              { encoding: 'utf8' }, cb);
};

var app = express();
app.get('/', function (req, res) {
  dust.stream("hello", {
    "async": request('http://www.dustjs.com/')
  }).pipe(res);
});

app.listen(3000, function () {
  console.log('Visit http://localhost:3000 to see streaming!');
});
