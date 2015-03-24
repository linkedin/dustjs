var dust = require('dustjs-linkedin');

var tmpl = dust.compile("Hello world! Using Dust version {version}!", "hello");
dust.loadSource(tmpl);

dust.render("hello", { version: dust.version }, function(err, out) {
  if(err) {
    console.error(err);
  } else {
    console.log(out);
  }
});
