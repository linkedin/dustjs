var fs = require('fs'),
    path = require('path'),
    express = require('express'),
    request = require('request'),
    dust = require('dustjs-linkedin');

dust.config.whitespace = true;

dust.onLoad = function(tmpl, cb) {
  fs.readFile(path.join('./views', path.resolve('/', tmpl + '.dust')),
              { encoding: 'utf8' }, cb);
};

var app = express();
app.get('/', function (req, res) {
  dust.stream("hello", {
    "async": function(chunk, context, bodies, params) {
      return chunk.map(function(chunk) {
        // Introducting an artificial delay to make streaming more apparent
        setTimeout(function() {
          request('http://www.dustjs.com/')
          .on('data', chunk.write.bind(chunk))
          .on('end', chunk.end.bind(chunk));
        }, 3000);
      });
    }
  }).pipe(res);
});

app.listen(3000, function () {
  console.log('Visit http://localhost:3000 to see streaming!');
});
