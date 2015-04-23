var requireTemplate = require('./requireTemplate.js');
var index = requireTemplate('index');

console.log("The name of the required template is", index.template.templateName);

console.log("You can render a template");
index({ mood: "happy" }, function(err, out) {
  if(err) {
    console.error(err);
  } else {
    console.log(out);
  }
});

console.log("Or stream it");
index({ mood: "happy" }).on('data', function(data) {
  console.log(data);
});
