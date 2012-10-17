(function(){
  //Add the tapper helper to test the Tap helper.
  dust.helpers.tapper = function(chunk, context, bodies, params) {
    var result = dust.helpers.tap(params.value,chunk,context);
    chunk.write(result);
    return chunk;
  };
  dust.register("select",body_0);
  function body_0(chk,ctx){
    return chk.write("<select style=\"clear: both;width: 150px;\">").section(ctx.get("examples"),ctx,{"block":body_1},null).write("</select>");
  }
  function body_1(chk,ctx){
    return chk.write("<option ").reference(ctx.get("selected"),ctx,"h").write("value=\"").write("\">").reference(ctx.get("name"),ctx,"h").write("</option>");
  }
  function body_2(chk,ctx){
    return chk.reference(ctx.getPath(true,[]),ctx,"h");
  }
  return body_0;
})();

jsDump.parsers['function'] = function(fn) { return fn.toString(); }

function renderDemo() {
  var tmpl = dust.cache["demo"], source = $('#input-context').val();
  $('#output-text').empty();
  if (tmpl && source) {
    setPending('#input-context');
    setPending('#output-text');
    try {
      eval("var context = " + source + ";");
      if (typeof context === 'function') {
        context = context();
      }
	      dust.stream("demo", context).on('data', function(data) {
        $('#output-text').append(dust.escapeHtml(data));
      }).on('end', function() {
        setOkay('#input-context');
        setOkay('#output-text');
      }).on('error', function(err) {
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
    .html('<i class="icon iconOk"></i> <span>Ready </span>');
  }

function setPending(sel) {
	$(sel).next()
	.removeClass('ok')
	.removeClass('error')
	.addClass('pending')
	.html('<i class="icon"></i> <span>Pending </span>');
}

function setError(sel, err) {
	$(sel).next()
	.removeClass('pending')
	.addClass('error')
	.html('<i class="icon iconFail"></i> <span>' + err.toString() + '</span>');
}

function dump(obj) {
	return js_beautify(jsDump.parse(obj), { indent_size: 2 });
}
function assignValue(id){
	$("#" +id+ " select option").each(function(index, option) {
		option.value = index;
	})
}

function renderSelect(examples, defaultTemplate, id) { 
  dust.render("select", {
    examples: examples,
    selected: function(chk, ctx) {
      if (ctx.current().name === defaultTemplate) return " selected ";
    } 
  }, function(err, output) { $('#' + id).html(output); assignValue(id);});
};

function getParamValue(paramName) {
  parName = paramName.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]');
  var pattern = '[\\?&]' + paramName + '=([^&#]*)';
  var regex = new RegExp(pattern);
  var matches = regex.exec(window.location.href);
  if (matches == null) return '';
  else return decodeURIComponent(matches[1].replace(/\+/g, ' '));
}

$(document).ready(function() {
  var testGroup = getParamValue('q') == "helpers" ? helpersTests : coreTests;
  testGroup.forEach(function(ex) {
    ex.tests.forEach(function(test, ex) { 
      if (test.error) {
        testGroup[ex].tests.splice(testGroup[ex].tests.indexOf(test), 1);  
      } else {
        dust.loadSource(dust.compile(test.source, test.name));
      }
    });
  });

	renderSelect(testGroup, "intro", "select-group");

  $('#select-group > select').change(function() {
    var groupIdx = $(this).val();
    renderSelect(testGroup[groupIdx].tests, "replace", "select-test"); 
    $('#select-test > select').change(function() {
      var test = testGroup[groupIdx].tests[$(this).val()];
      $('#input-source').val(test.source);
      $('#input-context').val(dump(test.context));
      $('#input-source').change();
    });   
    $('#select-test > select').change();  
  });

	$('#input-source').change(function() {
		setPending('#input-source');
		try {
			var compiled = dust.compile($(this).val(), "demo");
			dust.loadSource(compiled);
			$('#output-js').text(js_beautify(compiled, { indent_size: 2 }));
			setOkay('#input-source');
		} catch(err) {
			setError('#input-source', err); return;
		}
		renderDemo();
	});

	$('#input-context').change(renderDemo);
	$('#select-group > select').change();
});