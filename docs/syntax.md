---
layout: docs
title: Dust Syntax
permalink: /docs/syntax/
---

##Dust Syntax


<h3 id="reference"><code>{reference}</code></h3>

A reference is used to insert values from your context (or JSON data) into your template.

A reference is a single opening curly brace `{`, followed by one or more characters of the following set, followed by a closing curly brace `}`:

- `a-z`
- `A-Z`
- `_` (underscore)
- `$`
- `0-9`
- `-`

NOTE: The first character of a reference cannot be `0-9` or `-`.

<h3 id="bodies"><code>{?bodies/}</code></h3>

<h4 id="exists"><code>{?exists/}</code></h4>

<h4 id="not-exists"><code>{^not-exists/}</code></h4>

<h4 id="section"><code>{#section/}</code></h4>

<h4 id="helper"><code>{@helper/}</code></h4>

<h4 id="else-bodies"><code>{:else}</code> Bodies</h4>

<h3 id="block"><code>{+block/}</code></h3>

<h3 id="inline-partial"><code>{&lt;inline-partial/}</code></h3>

<h3 id="partial"><code>{&gt;partial/}</code></h3>

<h3 id="special"><code>{~special}</code></h3>

A special is converted to a special character

A special is defined as an opeing curly brace `{`, followed by a tilde `~`, follwed by any of the characters in a [reference](#reference), followed by a closing curly brace `}`. Dust supports five "specials":

- `{~s}` becomes a single space
- `{~n}` becomes a new line
- `{~r}` becomes a carriage return
- `{~lb}` becomes a left curly brace `{`
- `{~rb}` becomes a right curly brace `}`
