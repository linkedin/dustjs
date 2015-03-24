// Enable Dust AMD loading
define.amd.dust = true;

// The require.js baseUrl is set to /lib/, but the views are stored outside of lib
require.config({
  paths: {
    "views": "../views"
  }
});

// Loading Dust, and then the Dust helpers. Then we can render some Dust!
require(["dustjs-linkedin/dist/dust-core"], function(dust) {
  require(["dustjs-helpers/dist/dust-helpers"], function() {
    dust.render("views/hello", {"version": dust.version}, function(err, out) {
      if(err) console.error(err);
      document.getElementsByTagName('body')[0].innerHTML = out;
    });
  });
});
