{
  function makeInteger(arr) {
    return parseInt(arr.join(''), 10);
  }
  function withPosition(arr) {
    return arr.concat([['line', line()], ['col', column()]]);
  }
}

start
  = body

/*-------------------------------------------------------------------------------------------------------------------------------------
   body is defined as anything that matches with the part 0 or more times
---------------------------------------------------------------------------------------------------------------------------------------*/
body
  = p:part* {
    var body = ["body"].concat(p);
    return withPosition(body);
  }

/*-------------------------------------------------------------------------------------------------------------------------------------
   part is defined as anything that matches with raw or comment or section or partial or special or reference or buffer
---------------------------------------------------------------------------------------------------------------------------------------*/
part
  = raw / comment / section / partial / special / reference / buffer

/*-------------------------------------------------------------------------------------------------------------------------------------
   section is defined as matching with with sec_tag_start followed by 0 or more white spaces plus a closing brace plus body
   plus bodies plus end_tag or sec_tag_start followed by a slash and closing brace
---------------------------------------------------------------------------------------------------------------------------------------*/
section "section"
  = t:sec_tag_start ws* rd b:body e:bodies n:end_tag?
  // non-self-closing format
  &{
    if( (!n) || (t[1].text !== n.text) ) {
      error("Expected end tag for "+t[1].text+" but it was not found.");
    }
    return true;
  }
  {
    e.push(["param", ["literal", "block"], b]);
    t.push(e, ["filters"]);
    return withPosition(t)
  }
  // self-closing format
  / t:sec_tag_start ws* "/" rd
  {
    t.push(["bodies"], ["filters"]);
    return withPosition(t)
  }

/*-------------------------------------------------------------------------------------------------------------------------------------
   sec_tag_start is defined as matching an opening brace followed by one of #?^<+@% plus identifier plus context plus param
   followed by 0 or more white spaces
---------------------------------------------------------------------------------------------------------------------------------------*/
sec_tag_start
  = ld t:[#?^<+@%] ws* n:identifier c:context p:params
  { return [t, n, c, p] }

/*-------------------------------------------------------------------------------------------------------------------------------------
   end_tag is defined as matching an opening brace followed by a slash plus 0 or more white spaces plus identifier followed
   by 0 or more white spaces and ends with closing brace
---------------------------------------------------------------------------------------------------------------------------------------*/
end_tag "end tag"
  = ld "/" ws* n:identifier ws* rd
  { return n }

/*-------------------------------------------------------------------------------------------------------------------------------------
   context is defined as matching a colon followed by an identifier
---------------------------------------------------------------------------------------------------------------------------------------*/
context
  = n:(":" n:identifier {return n})?
  { return n ? ["context", n] : ["context"] }

/*-------------------------------------------------------------------------------------------------------------------------------------
  params is defined as matching white space followed by = and identfier or inline
---------------------------------------------------------------------------------------------------------------------------------------*/
params "params"
  = p:(ws+ k:key "=" v:(number / identifier / inline) {return ["param", ["literal", k], v]})*
  { return ["params"].concat(p) }

/*-------------------------------------------------------------------------------------------------------------------------------------
   bodies is defined as matching a opening brace followed by key and closing brace, plus body 0 or more times.
---------------------------------------------------------------------------------------------------------------------------------------*/
bodies "bodies"
  = p:(ld ":" k:key rd v:body {return ["param", ["literal", k], v]})*
  { return ["bodies"].concat(p) }

/*-------------------------------------------------------------------------------------------------------------------------------------
   reference is defined as matching a opening brace followed by an identifier plus one or more filters and a closing brace
---------------------------------------------------------------------------------------------------------------------------------------*/
reference "reference"
  = ld n:identifier f:filters rd
  { return withPosition(["reference", n, f]) }

/*-------------------------------------------------------------------------------------------------------------------------------------
  partial is defined as matching a opening brace followed by a > plus anything that matches with key or inline plus
  context followed by slash and closing brace
---------------------------------------------------------------------------------------------------------------------------------------*/
partial "partial"
  = ld s:(">"/"+") ws* n:(k:key {return ["literal", k]} / inline) c:context p:params ws* "/" rd
  {
    var key = (s === ">") ? "partial" : s;
    return withPosition([key, n, c, p])
  }

/*-------------------------------------------------------------------------------------------------------------------------------------
   filters is defined as matching a pipe character followed by anything that matches the key
---------------------------------------------------------------------------------------------------------------------------------------*/
filters "filters"
  = f:("|" n:key {return n})*
  { return ["filters"].concat(f) }

/*-------------------------------------------------------------------------------------------------------------------------------------
   special is defined as matching a opening brace followed by tilde plus key plus a closing brace
---------------------------------------------------------------------------------------------------------------------------------------*/
special "special"
  = ld "~" k:key rd
  { return withPosition(["special", k]) }

/*-------------------------------------------------------------------------------------------------------------------------------------
   identifier is defined as matching a path or key
---------------------------------------------------------------------------------------------------------------------------------------*/
identifier "identifier"
  = p:path
  {
    var arr = ["path"].concat(p);
    arr.text = p[1].join('.').replace(/,line,\d+,col,\d+/g,'');
    return arr;
  }
  / k:key
  {
    var arr = ["key", k];
    arr.text = k;
    return arr;
  }

number "number"
  = n:(float / integer) { return ['literal', n]; }

float "float"
  = l:integer "." r:unsigned_integer { return parseFloat(l + "." + r); }

unsigned_integer "unsigned_integer"
  = digits:[0-9]+ { return makeInteger(digits); }

signed_integer "signed_integer"
  = sign:'-' n:unsigned_integer { return n * -1; }

integer "integer"
  = signed_integer / unsigned_integer

/*-------------------------------------------------------------------------------------------------------------------------------------
  path is defined as matching a key plus one or more characters of key preceded by a dot
---------------------------------------------------------------------------------------------------------------------------------------*/
path "path"
  = k:key? d:(array_part / array)+
  {
    d = d[0];
    if (k && d) {
      d.unshift(k);
      return withPosition([false, d])
    }
    return withPosition([true, d])
  }
  / "." d:(array_part / array)*
  {
    if (d.length > 0) {
      return withPosition([true, d[0]])
    }
    return withPosition([true, []])
  }

/*-------------------------------------------------------------------------------------------------------------------------------------
   key is defined as a character matching a to z, upper or lower case, followed by 0 or more alphanumeric characters
---------------------------------------------------------------------------------------------------------------------------------------*/
key "key"
  = h:[a-zA-Z_$] t:[0-9a-zA-Z_$-]*
  { return h + t.join('') }

array "array"
  = i:( lb a:( n:([0-9]+) {return n.join('')} / identifier) rb  {return a; }) nk: array_part? { if(nk) { nk.unshift(i); } else {nk = [i] } return nk; }

array_part "array_part"
  = d:("." k:key {return k})+ a:(array)? { if (a) { return d.concat(a); } else { return d; } }

/*-------------------------------------------------------------------------------------------------------------------------------------
   inline params is defined as matching two double quotes or double quotes plus literal followed by closing double quotes or
   double quotes plus inline_part followed by the closing double quotes
---------------------------------------------------------------------------------------------------------------------------------------*/
inline "inline"
  = '"' '"'                 { return withPosition(["literal", ""]) }
  / '"' l:literal '"'       { return withPosition(["literal", l]) }
  / '"' p:inline_part+ '"'  { return withPosition(["body"].concat(p)) }

/*-------------------------------------------------------------------------------------------------------------------------------------
  inline_part is defined as matching a special or reference or literal
---------------------------------------------------------------------------------------------------------------------------------------*/
inline_part
  = special / reference / l:literal { return ["buffer", l] }

buffer "buffer"
  = e:eol w:ws*
  { return withPosition(["format", e, w.join('')]) }
  / b:(!tag !raw !comment !eol c:. {return c})+
  { return withPosition(["buffer", b.join('')]) }

/*-------------------------------------------------------------------------------------------------------------------------------------
   literal is defined as matching esc or any character except the double quotes and it cannot be a tag
---------------------------------------------------------------------------------------------------------------------------------------*/
literal "literal"
  = b:(!tag c:(esc / [^"]) {return c})+
  { return b.join('') }

esc
  = '\\"' { return '"' }

raw "raw"
  = "{`" rawText:(!"`}" character:. {return character})* "`}"
  { return withPosition(["raw", rawText.join('')]) }
comment "comment"
  = "{!" c:(!"!}" c:. {return c})* "!}"
  { return withPosition(["comment", c.join('')]) }

/*-------------------------------------------------------------------------------------------------------------------------------------
   tag is defined as matching an opening brace plus any of #?^><+%:@/~% plus 0 or more whitespaces plus any character or characters that
   doesn't match rd or eol plus 0 or more whitespaces plus a closing brace
---------------------------------------------------------------------------------------------------------------------------------------*/
tag
  = ld ws* [#?^><+%:@/~%] ws* (!rd !eol .)+ ws* rd
  / reference

ld
  = "{"

rd
  = "}"

lb
  = "["

rb
  = "]"

eol
  = "\n"        //line feed
  / "\r\n"      //carriage + line feed
  / "\r"        //carriage return
  / "\u2028"    //line separator
  / "\u2029"    //paragraph separator

ws
  = [\t\v\f \u00A0\uFEFF] / eol
