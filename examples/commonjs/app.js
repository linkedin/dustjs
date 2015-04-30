var requireTemplate = require('./requireTemplate.js');
var index = requireTemplate('index');

console.log("The name of the required template is", index.template.templateName);

// You can render a template
index({ mood: "happy" }, function(err, out) {
  if(err) {
    console.error(err);
  } else {
    console.log(out);
  }
});

// You can also stream it
index({ mood: "streamy" }).on('data', function(data) {
  console.log(data);
});
