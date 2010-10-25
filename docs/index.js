dustExamples.forEach(function(ex) {
  dust.loadSource(dust.compile(ex.source, ex.name));
});

function renderDemo() {
  var tmpl = dust.cache["demo"],
  source = $('#input-context').val();

  $('#output-text').empty();

  if (tmpl && source) {
    setPending('#input-context');
    setPending('#output-text');
    try {
      eval("var context = " + source + ";");
      if (typeof context === 'function') {
        context = context();
      }
      dust.stream("demo", context)
          .on('data', function(data) {
            $('#output-text').append(dust.escapeHtml(data));
          })
          .on('end', function() {
            setOkay('#input-context');
            setOkay('#output-text');
          })
          .on('error', function(err) {
            setError('#input-context', err);
          });
    } catch(err) {
      setError('#input-context', err);
    }
  }
}

function setOkay(sel) {
  $(sel).next()
  .removeClass('pending')
  .addClass('ok')
  .html('Ready');
}

function setPending(sel) {
  $(sel).next()
  .removeClass('ok')
  .removeClass('error')
  .addClass('pending')
  .html('Pending');
}

function setError(sel, err) {
  $(sel).next()
  .removeClass('pending')
  .addClass('error')
  .html(err.toString());
}

function dump(obj) {
  jsDump.parsers['function'] = function(fn) {
    return fn.toString();
  }
  return js_beautify(jsDump.parse(obj), {
    indent_size: 2
  });
}

function dumpError(err) {
  var out = err.testName + " -> ";
  if (!err.message) {
    err.message = jsDump.parse(err.expected)
    + " " + err.operator + " " + jsDump.parse(err.actual);
  }
  return out + err.stack;
}

function runSuite() {
  var suite = new uutest.Suite({
    start: function() {
      $("#test-console").empty();
    },
    pass: function() {
      $("#test-console").append(".");
    },
    fail: function() {
      $("#test-console").append("F");
    },
    done: function(passed, failed, elapsed) {
      $("#test-console").append("\n");
      $("#test-console").append(passed + " passed " + failed + " failed " + "(" + elapsed + "ms)");
      this.errors.forEach(function(err) {
        $("#test-console").append("\n");
        $("#test-console").append(dust.escapeHtml(dumpError(err)));
      });
    }
  });
  coreSetup(suite, dustExamples.slice(1));
  suite.run();
}

$(document).ready(function(){
  runSuite();

  $('#tagline').empty();
  dust.loadSource(dust.compile(dustExamples[0].source, "intro"));
  dust.stream("intro", dustExamples[0].context()).on('data', function(data) {
    $('#tagline').append(data);
  });

  dust.render("select", {
    examples: dustExamples,
    selected: function(chk, ctx) {
      if (ctx.current().name === "replace") return "selected";
    }
  }, function(err, output) {
    $('#select').html(output);
  });

  $('#select > select').change(function() {
    var idx = $(this).val();
    $('#input-source').val(dustExamples[idx].source);
    $('#input-context').val(dump(dustExamples[idx].context));
    $('#input-source').change();
  });

  $(".cwrap > h3 > span").click(function() {
    var $console = $(this).closest(".cwrap").children(".console"),
    $anchor = $(this).children("a");

    if ($console.is(":visible")) {
      $console.hide();
      $anchor.html("show");
    } else {
      $console.show();
      $anchor.html("hide");
    }
    return false;
  });

  $('#input-source').change(function() {
    setPending('#input-source');
    try {
      var compiled = dust.compile($(this).val(), "demo");
      dust.loadSource(compiled);
      $('#output-js').val(js_beautify(compiled, {
        indent_size: 2
      }));
      setOkay('#input-source');
    } catch(err) {
      setError('#input-source', err);
      return;
    }
    renderDemo();
  });

  $('#input-context').change(renderDemo);

  $('#select > select').change();

  var sections = $("body > div");
  var cur_id;

  $(window).scroll(function() {
    var scrollTop = $(window).scrollTop();

    if (scrollTop === 0) {
      cur_id = undefined;
      $('.docked').remove();
      return;
    }

    sections.each(function(idx, section) {
      var sectionTop = section.offsetTop,
          sectionBottom = sectionTop + section.offsetHeight;

      if (scrollTop >= sectionTop && scrollTop < sectionBottom) {
        var foof = $(section).find('.header').clone();
        if (section.id !== cur_id) {
          cur_id = section.id;
          $('.docked').remove();
          foof.appendTo('body');
          foof.addClass('docked');
        }
        return false;
      }
    });
  });
});