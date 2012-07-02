/*-------------------------------------------------------------------------------------------------------------------------------------
   Start tag this is the first function to be executed.
---------------------------------------------------------------------------------------------------------------------------------------*/

start
  = body

/*-------------------------------------------------------------------------------------------------------------------------------------
   Match anything that match with part 0 or more times
---------------------------------------------------------------------------------------------------------------------------------------*/
body
  = p:part* { return ["body"].concat(p) }

/*-------------------------------------------------------------------------------------------------------------------------------------
   Match something that matches with comment or section or partial or special or reference or buffer
---------------------------------------------------------------------------------------------------------------------------------------*/
part
  = comment / section / partial / special / reference / buffer

/*-------------------------------------------------------------------------------------------------------------------------------------
   Match anything that matches with sec_tag_start followed by 0 or more white spaces plus a close curly bracket plus something that
   matches with body plus something that matches with bodies plus something that matches with end_tag or
   match with sec_tag_star followed by a slash and close curly bracket
---------------------------------------------------------------------------------------------------------------------------------------*/
section "section"
  = t:sec_tag_start ws* rd b:body e:bodies n:end_tag &{ return t[1].text === n.text;}
  { e.push(["param", ["literal", "block"], b]); t.push(e); return t }
  / t:sec_tag_start ws* "/" rd
  { t.push(["bodies"]); return t }

/*-------------------------------------------------------------------------------------------------------------------------------------
   Match an open curly bracket followed by one of this signs #?^<+@% plus something that matches with identifier plus something that
   matches with context plus something that matches with param followed by 0 or more white spaces
---------------------------------------------------------------------------------------------------------------------------------------*/
sec_tag_start
  = ld t:[#?^<+@%] ws* n:identifier c:context p:params
  { return [t, n, c, p] }

/*-------------------------------------------------------------------------------------------------------------------------------------
   Match an open curly bracket followed by a slash plus 0 or more white spaces plus something that matches with identifier followed 
   by 0 or more white spaces and finishes with a close curly bracket
---------------------------------------------------------------------------------------------------------------------------------------*/
end_tag "end tag"
  = ld "/" ws* n:identifier ws* rd
  { return n }

/*-------------------------------------------------------------------------------------------------------------------------------------
   Match a colon followed by anything that matches with identifier
---------------------------------------------------------------------------------------------------------------------------------------*/
context
  = n:(":" n:identifier {return n})?
  { return n ? ["context", n] : ["context"] }

/*-------------------------------------------------------------------------------------------------------------------------------------
   Match one white space followed by something that matches with key plus a equality sign plus anything that matches with identifier or
   inline
---------------------------------------------------------------------------------------------------------------------------------------*/
params "params"
  = p:(ws+ k:key "=" v:(number / identifier / inline) {return ["param", ["literal", k], v]})*
  { return ["params"].concat(p) }

/*-------------------------------------------------------------------------------------------------------------------------------------
   Match an open curly bracket followed by something that matches with a key followed by a close curly bracket, plus something that
   matches with body. 0 or more times.
---------------------------------------------------------------------------------------------------------------------------------------*/
bodies "bodies"
  = p:(ld ":" k:key rd v:body {return ["param", ["literal", k], v]})*
  { return ["bodies"].concat(p) }

/*-------------------------------------------------------------------------------------------------------------------------------------
   Match an open curly bracket followed by something that matches with identifier plus something that matches with filters plus a close
   curly brackets
---------------------------------------------------------------------------------------------------------------------------------------*/
reference "reference"
  = ld n:identifier f:filters rd
  { return ["reference", n, f] }

/*-------------------------------------------------------------------------------------------------------------------------------------
   Match an open curly bracket followed by a greater than sign plus anything that matches with key or inline plus something that matches
   with context followed by ane slash and a close curly bracket
---------------------------------------------------------------------------------------------------------------------------------------*/
partial "partial"
  = ld s:(">"/"+") n:(k:key {return ["literal", k]} / inline) c:context p:params ws* "/" rd
  { var key = (s ===">")? "partial" : s; return [key, n, c, p] }

/*-------------------------------------------------------------------------------------------------------------------------------------
   Match a pipe character followed by anything that matches with key
---------------------------------------------------------------------------------------------------------------------------------------*/
filters "filters"
  = f:("|" n:key {return n})*
  { return ["filters"].concat(f) }

/*-------------------------------------------------------------------------------------------------------------------------------------
   Match an open curly bracket followed by tilde character plus anything that matches with key plus a close curly bracket
---------------------------------------------------------------------------------------------------------------------------------------*/
special "special"
  = ld "~" k:key rd
  { return ["special", k] }

/*-------------------------------------------------------------------------------------------------------------------------------------
   Match anything that match with path or key
---------------------------------------------------------------------------------------------------------------------------------------*/
identifier "identifier"
  = p:path     { var arr = ["path"].concat(p); arr.text = p[1].join('.'); return arr; }
  / k:key      { var arr = ["key", k]; arr.text = k; return arr; }

/*-------------------------------------------------------------------------------------------------------------------------------------
   Match an integer or float (1 or 1.00)
---------------------------------------------------------------------------------------------------------------------------------------*/

number "number"
  = n:(frac / integer) { return ['literal', n]; }

frac "frac"
  = l:integer "." r:integer+ { return parseFloat(l + "." + r.join('')); }

integer "integer"
  = digits:[0-9]+ { return parseInt(digits.join(""), 10); }

/*-------------------------------------------------------------------------------------------------------------------------------------
   Match anything that match with key plus one or more characters that match with key again but preceded by a dot "." 
---------------------------------------------------------------------------------------------------------------------------------------*/
path "path"
  = k:key? d:(nestedKey / array)+ {
    d = d[0]; 
    if (k && d) {
      d.unshift(k);
      return [false, d];;
    }
    return [true, d];
  }
  / "." { return [true, []] }

/*-------------------------------------------------------------------------------------------------------------------------------------
   Match any character since a to z, upper or lower case, followed by 0 or more alphanumeric characters  
---------------------------------------------------------------------------------------------------------------------------------------*/
key "key"
  = h:[a-zA-Z_$] t:[0-9a-zA-Z_$]*
  { return h + t.join('') }
  
nestedKey "nestedKey"
  = d:("." k:key {return k})+ a:(array)? { if (a) { return d.concat(a); } else { return d; } }

array "array"
  = i:("[" a:([0-9]+) "]" {return a.join('')}) nk: nestedKey? { if(nk) { nk.unshift(i); } else {nk = [i] } return nk; }

/*-------------------------------------------------------------------------------------------------------------------------------------
   Match two double quotes or double quotes plus something that matches with literal plus other double quotes or  
   double quotes plus something that matches with inline_part plus other double quotes
---------------------------------------------------------------------------------------------------------------------------------------*/
inline "inline"
  = '"' '"'                 { return ["literal", ""] }
  / '"' l:literal '"'       { return ["literal", l] }
  / '"' p:inline_part+ '"'  { return ["body"].concat(p) }

/*-------------------------------------------------------------------------------------------------------------------------------------
   Match special or reference or literal  
---------------------------------------------------------------------------------------------------------------------------------------*/
inline_part
  = special / reference / l:literal { return ["buffer", l] }

/*-------------------------------------------------------------------------------------------------------------------------------------
   Match eol plus 0 or more white spaces or character or characters that doesn't match with tag, eol or comment  
---------------------------------------------------------------------------------------------------------------------------------------*/
buffer "buffer"
  = e:eol w:ws*
  { return ["format", e, w.join('')] }
  / b:(!tag !eol !comment c:. {return c})+
  { return ["buffer", b.join('')] }

/*-------------------------------------------------------------------------------------------------------------------------------------
   Match anything that match with esc or any character but double quotes or tag.
---------------------------------------------------------------------------------------------------------------------------------------*/
literal "literal"
  = b:(!tag c:(esc / [^"]) {return c})+
  { return b.join('') }

/*-------------------------------------------------------------------------------------------------------------------------------------
   Match this three characters \\"
---------------------------------------------------------------------------------------------------------------------------------------*/
esc
  = '\\"' { return '"' }

/*-------------------------------------------------------------------------------------------------------------------------------------
   Match this "{!" plus any character or characters that doesn't match with this "!}" plus this two characters "!}" 
---------------------------------------------------------------------------------------------------------------------------------------*/
comment "comment"
  = "{!" c:(!"!}" c:. {return c})* "!}"
  { return ["comment", c.join('')] }

/*-------------------------------------------------------------------------------------------------------------------------------------
   Match an open curly bracket plus any of this characters #?^><+%:@/~% plus 0 or more whitespaces plus any character or characters that 
   doesn't match rd or eol plus 0 or more whitespaces plus a close curly bracket
---------------------------------------------------------------------------------------------------------------------------------------*/
tag
  = ld [#?^><+%:@/~%] ws* (!rd !eol .)+  ws* rd
  / reference

/*-------------------------------------------------------------------------------------------------------------------------------------
   Match an open curly bracket
---------------------------------------------------------------------------------------------------------------------------------------*/
ld
  = "{"

/*-------------------------------------------------------------------------------------------------------------------------------------
   Match a close curly bracket
---------------------------------------------------------------------------------------------------------------------------------------*/
rd
  = "}"

/*-------------------------------------------------------------------------------------------------------------------------------------
   Match the end of the line
---------------------------------------------------------------------------------------------------------------------------------------*/
eol 
  = "\n"        //line feed
  / "\r\n"      //carriage + line feed
  / "\r"        //carriage return
  / "\u2028"    //line separator
  / "\u2029"    //paragraph separator

/*-------------------------------------------------------------------------------------------------------------------------------------
   Match one whitespace
---------------------------------------------------------------------------------------------------------------------------------------*/
ws
  = [\t\v\f \u00A0\uFEFF] / eol
