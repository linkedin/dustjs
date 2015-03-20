var path = require('path'),
    hoffman = require('hoffman'),
    express = require('express'),
    request = require('request');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'dust');
app.engine('dust', hoffman.__express());

// This is the important part-- it adds res.stream()
app.use(hoffman.stream);

app.get('/', function (req, res) {
  res.stream("hello", {
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
  });
});

app.listen(3000, function () {
  console.log('Visit http://localhost:3000 to see streaming!');
});
