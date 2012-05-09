{
  function wrap(node, ck) {
    node['text'] = input.substring(ck.split('@')[1], pos);
    return node;
  }
}

start
  = body

body
  = p:part* { return ["body"].concat(p) }

part
  = comment / section / partial / special / reference / buffer

section "section"
  = t:sec_tag_start ws* rd b:body e:bodies n:end_tag &{ return t[1].text === n.text;}
   { e.push(["param", ["literal", "block"], b]); t.push(e); return t }
   / t:sec_tag_start "/" rd
   { t.push(["bodies"]); return t }

sec_tag_start
  = ld t:[#?^<+@%] n:identifier c:context p:params
  { return [t, n, c, p] }

end_tag "end tag"
  = ld "/" n:identifier rd
  { return n }

context
  = n:(":" n:identifier {return n})?
  { return n ? ["context", n] : ["context"] }

params "params"
  = p:(ws k:key "=" v:(identifier / inline) {return ["param", ["literal", k], v]})*
  { return ["params"].concat(p) }

bodies "bodies"
  = p:(ld ":" k:key rd v:body {return ["param", ["literal", k], v]})*
  { return ["bodies"].concat(p) }

reference "reference"
  = ld n:identifier f:filters rd
  { return ["reference", n, f] }

partial "partial"
  = ld ">" n:(k:key {return ["literal", k]} / inline) c:context p:params "/" rd
  { return ["partial", n, c, p] }

filters "filters"
  = f:("|" n:key {return n})*
  { return ["filters"].concat(f) }

special "special"
  = ld "~" k:key rd
  { return ["special", k] }

identifier "identifier"
  = p:path     { return wrap(["path"].concat(p), cacheKey) }
  / k:key      { return wrap(["key", k], cacheKey) }

path "path"
  = k:key? d:("." k:key {return k})+ {
    if (k) { d.unshift(k); return [false, d]; }
    return [true, d];
  }
  / "." { return [true, []] }

key "key"
  = h:[a-zA-Z_$] t:[0-9a-zA-Z_$]*
  { return h + t.join('') }

inline "inline"
  = '"' '"'                 { return ["literal", ""] }
  / '"' l:literal '"'       { return ["literal", l] }
  / '"' p:inline_part+ '"'  { return ["body"].concat(p) }

inline_part
  = special / reference / l:literal { return ["buffer", l] }

buffer "buffer"
  = e:eol w:ws*
  { return ["format", e, w.join('')] }
  / b:(!tag !eol !comment c:. {return c})+
  { return ["buffer", b.join('')] }

literal "literal"
  = b:(!tag !eol c:(esc / [^"]) {return c})+
  { return b.join('') }

esc
  = '\\"' { return '"' }

comment "comment"
  = "{!" c:(!"!}" c:. {return c})* "!}"
  { return ["comment", c.join('')] }

tag
  = ld [#?^><+%:@/~%] (!rd !eol .)+ rd
  / reference

ld
  = "{"

rd
  = "}"

eol
  = "\n"
  / "\r\n"
  / "\r"
  / "\u2028"
  / "\u2029"

ws
  = [\t\v\f \u00A0\uFEFF]
