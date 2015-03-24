dust.render("views/hello", {"version": dust.version}, function(err, out) {
  if(err) console.error(err);
  document.getElementsByTagName('body')[0].innerHTML = out;
});
