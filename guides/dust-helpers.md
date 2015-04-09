---
title: Dust Core Helpers
layout: guides
permalink: /guides/dust-helpers/
---

# Using Helpers

Dust helpers extend the templating language in the same way as context helpers. Unlike context helpers, however, Dust helpers are global and can be used in any template without including them in the context.

Helpers look like `{@helper}`.

## Installing Helpers

Officially supported helpers are bundled separately in the `dustjs-helpers` library. After the dustjs-linkedin library is loaded, follow the same instructions in the [Setup guide](/guides/setup/) to install `dustjs-helpers`.

If you are using Node.js, then you can require the helpers directly and get back a Dust instance with the helpers preloaded:

```
var dust = require('dustjs-helpers');
```

## Logic Helpers

The helpers library comes with the following logic helpers:

* `{@eq}`: strictly equal to
* `{@ne}`: not strictly equal to
* `{@gt}`: greater than
* `{@lt}`: less than
* `{@gte}`: greater than or equal to
* `{@lte}`: less than or equal to

These helpers allow you to print content if one value compared in a certain way to another value is true. For each helper, you specify the first value with the `key` attribute and the second value with the `value` attribute. Both `key` and `value` can point to a reference or a literal value. Wrap literal values in quotes and leave references un-quoted.

In the following example, the first helper looks for the value of `level` in the underlying JSON data and checks if it is equal to the literal string "master". The second checks to see if the value for the `age` reference is greater than the value of the `starfighterRentalAge` reference.

<dust-demo templatename="helpers_logic">
<dust-demo-template showtemplatename="true">
{@eq key=level value="master"}You are no longer a Padawan. {/eq}
{@gt key=age value=starfighterRentalAge}Rent a Starfighter!{/gt}
</dust-demo-template>
<dust-demo-json>
{
  "level": "master",
  "age": 27,
  "starfighterRentalAge": 25
}
</dust-demo-json>
</dust-demo>

### Else

For all logic helpers, you can create an `{:else}` block that will render if the test is false.

<dust-demo templatename="helpers_else">
<dust-demo-template showtemplatename="true">
{@eq key=level value="master"}
  You are no longer a Padawan.
{:else}
  You have much to learn, young Padawan.
{/eq}
</dust-demo-template>
<dust-demo-json>
{
  "level": "padawan"
}
</dust-demo-json>
</dust-demo>

### Casting

If you are comparing a literal value to one that you know is not a string (e.g. a number or a boolean), make sure to specify the `type` attribute so Dust knows how to cast the literal value.

<dust-demo templatename="helpers_casting">
<dust-demo-template showtemplatename="true">
{@eq key=bilbosAge value="50" type="number"}Looking nifty at fifty, Bilbo! {/eq}
{@gt key=gandalfsAge value="10000"}Gandalf is really old...{/gt}
</dust-demo-template>
<dust-demo-json>
{
  "bilbosAge": 50,
  "gandalfsAge": 12345
}
</dust-demo-json>
</dust-demo>

## Separator Helper

Iterating over lists sometimes requires slightly different treatment of the first or last items in the list. The `{@sep}` helper and its companions `{@first}` and `{@last}` provide this functionality.

* `{@sep}`: Output for every loop iteration except the last
* `{@first}`: Output only on the first loop iteration
* `{@last}`: Only output on the last loop iteration

<dust-demo templateName="grammatical-correctness">
<dust-demo-template showTemplateName="true">
{#guests}
  {@first}Hello {/first}
  {@last}and {/last}
  {.}{@sep}, {/sep}
  {@last}!{/last}
{/guests}
</dust-demo-template>
<dust-demo-json>
{
  "guests": ["Alice", "Bob", "Charlie"]
}
</dust-demo-json>
</dust-demo>

## Select Helper

The `@select` helper can be nested around the other logic helpers to form a `switch`-like structure, allowing you to take one action based on multiple comparisons with a single key value. You move the `key` attribute into the `@select` helper and set only a `value` attribute for each logic helper inside the `@select`.

You can specify what to do if none of the conditions are true using a `@none` helper in the `@select`. Its opposite, the `@any` helper, is run if any of the conditions are true, in addition to those true conditions.

When a true logic helper condition is found in the `@select`, Dust executes the condition's body and skips the rest of the truth tests. `{@any}` and `{@none}` tests are always evaluated, no matter where they occur.

<dust-demo templatename="helpers_select">
<dust-demo-template showtemplatename="true">
&lt;span class="
  {@select key=testEnabled}
    {@any}test-enabled {/any}
    {@none}test-disabled {/none}
    {@eq value="puppies"}test-puppies{/eq}
    {@eq value="bunnies"}test-bunnies{/eq}
  {/select}
"&gt;
</dust-demo-template>
<dust-demo-json>
{
  "testEnabled": "bunnies"
}
</dust-demo-json>
</dust-demo>

*Note that the `@default` helper has been* ***deprecated*** *as of Dust Helpers version 1.6.0.* This helper was similar to `@none`, except there could only be one instance per `@select`, and it needed to be placed after all logic helpers to ensure that all previous comparisons were false.

## Math Helper

Another handy helper is the `@math` helper. It allows you to take different courses of action based on the result of a mathematical expression. You provide it the lefthand operand using the `key` attribute, the operation to perform using the `method` attribute, and the righthand operand using the `operand` attribute. Then you can nest logical operators within the `@math` tag to test the result of the `@math` helper. For example, we can combine a loop's `$idx` with the `@math` helper to add a class to every other item in a list:

<dust-demo templatename="helpers_math">
<dust-demo-template showtemplatename="true">
&lt;ul&gt;
  {#flavors}
    &lt;li
      {@math key=$idx method="mod" operand="2"}
        {@eq value="0" type="number"} class="alt-row"{/eq}
      {/math}&gt;
      {name}
    &lt;/li&gt;
  {/flavors}
&lt;/ul&gt;
</dust-demo-template>
<dust-demo-json>
{
  "flavors": [
    { "name": "red bean" },
    { "name": "green tea" },
    { "name": "mango" },
    { "name": "peanut" }
  ]
}
</dust-demo-json>
</dust-demo>

A full list of values that the `method` attribute can take is found in the [Helpers API documentation](/docs/helpers-api/).

### Printing the Result

To simply output the result of the mathematical expression, use the `@math` helper as a self-closing tag.

<dust-demo templatename="helpers_math_output">
<dust-demo-template showtemplatename="true">
There is {@math key=100 method="subtract" operand=progress/}% left to do.
</dust-demo-template>
<dust-demo-json>
{
  "progress": 70
}
</dust-demo-json>
</dust-demo>

## Debugging with `@contextDump`

The `{@contextDump}` helper outputs the current context portion of the JSON data model to the output stream. This can help with debugging if you suspect the context data is not as expected or you aren't sure what the current context is.

You can set `key="full"` to print the full context, and `to="console"` to print to the console.

Remove this helper when you are done debugging.

<dust-demo templatename="helpers_contextdump">
<dust-demo-template showtemplatename="true">
{#houses.gryffindor}
  {! Default: key="current" and to="output" !}
  {@contextDump/}
  {! Check your console for the full context !}
  {@contextDump key="full" to="console"/}
{/houses.gryffindor}
</dust-demo-template>
<dust-demo-json>
{
  "houses": {
    "gryffindor": {
      "founder": "Godric Gryffindor"
    },
    "hufflepuff": {
      "founder": "Helga Hufflepuff"
    }
  }
}
</dust-demo-json>
</dust-demo>

# Adding New Helpers

Helpers are written in the same way as [context helpers](/guides/context-helpers). Once you've written your helper, attach it to the `dust.helpers` object.

```js
function yell(chunk, context, bodies, params) {
  return chunk.tap(function(data) {
    return data.toUpperCase();
  }).render(bodies.block, context).untap();
}
dust.helpers.yell = yell;
```
