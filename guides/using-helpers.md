---
title: DustJS | Getting Started
layout: guides
permalink: /guides/using-helpers/
---

# Using Helpers

Helpers are extensions added to Dust to increase its functionality. They make it possible for anyone to extend the way Dust works. They are commonly used to add functionality related to things like logic, formatting, and internationalization. Helpers are denoted by the `@` symbol. Let's take a look at some commonly used helpers.

## Installing Helpers

Officially supported helpers are bundled separately in the `dustjs-helpers` library. After the dustjs-linkedin library is loaded, follow the same instructions in the [Getting Started guide](/guides/getting-started/) to install `dustjs-helpers`. If you are cloning or downloading from GitHub, you can find the helpers in the [dustjs-helpers repository](https://github.com/linkedin/dustjs-helpers).

If you are using Node.js, then the following `require` statements will ensure you have the needed Dust modules available.

```
require('dustjs-linkedin');
require('dustjs-helpers');
```

## Logic Helpers

The helpers library comes with the following logic helpers:

* `{@eq}` equal to
* `{@ne}` not equal to
* `{@gt}` greater than
* `{@lt}` less than
* `{@gte}` greater than or equal to
* `{@lte}` less than or equal to

These helpers allow you to print content if one value compared in a certain way to another value is true. For each helper, you specify the first value with the `key` attribute and the second value with the `value` attribute. Both `key` and `value` can point to a reference or a literal value. Wrap literal values in quotes and leave references un-quoted.

In the following example, the first helper looks for the value of `level` in the underlying JSON data and checks if it is equal to the literal string "master". The second checks to see if the value for the `age` reference is greater than the value of the `starfighterRentalAge` reference.

<dust-demo template-name="helpers-logic">
<dust-demo-template>
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

For all logic helpers, you can use an `{:else}` clause to do something if the comparison is false.

<dust-demo template-name="helpers-else">
<dust-demo-template>
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

If you are comparing a literal value to one that you know is not a string (e.g. a number or a boolean), make sure to specify the `type` attribute so Dust knows how to cast the literal value. For `@lt`, `@gt`, `@lte`, and `@gte`, the type is automatically coerced to a number.

<dust-demo template-name="helpers-casting">
<dust-demo-template>
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

## Select Helper

The `@select` helper can be nested around the other logic helpers to form a `switch`-like structure, allowing you to take one action based on multiple comparisons with a single key value. You move the `key` attribute to `@select` and set only a `value` attribute for each logic helper inside the `@select`.

You can specify what to do if none of the conditions are true using a `@none` helper in the `@select`. Its opposite, the `@any` helper, is run if any of the conditions are true, in addition to those true conditions. Dust evaluates `@any` and `@none` asynchronously, so there can be any number of them in any order.

When a true logic helper condition is found in the `@select`, Dust executes the condition's body and skips the rest of its sibling conditions, excepting any `@any` helpers.

<dust-demo template-name="helpers-select">
<dust-demo-template>
&lt;span class="
  {@select key=test}
    {@any}test-enabled {/any}
    {@none}test-disabled {/none}
    {@eq="puppies"}test-puppies{/eq}
    {@eq="bunnies"}test-bunnies{/eq}
  {/select}
"&rt;
</dust-demo-template>
<dust-demo-json>
{
  "testEnabled": "bunnies"
}
</dust-demo-json>
</dust-demo>

<!-- TODO update version number -->
*Note that the `@default` helper has been* ***deprecated*** *as of Dust Helpers version 1.6.0.* This helper was similar to `@none`, except there could only be one instance per `@select`, and it needed to be placed after all logic helpers to ensure that all previous comparisons were false.

## Loop Index

When inside the body of a loop, Dust provides the special variable `$idx` that contains the index of the current array element. Knowing which iteration the loop is currently on can be useful for various purposes. For example, you could add a class to the first item in a list:

<dust-demo template-name="helpers-loop">
<dust-demo-template>
&lt;ol&gt;
  {#ranks}
    &lt;li{@eq key=$idx value=0} class="first"{/eq}&gt;{position}&lt;/li&gt;
  {/ranks}
&lt;/ol&gt;
</dust-demo-template>
<dust-demo-json>
{
  "ranks": [
    { "position": "Principal" },
    { "position": "Soloist" },
    { "position": "Corps" },
    { "position": "Apprentice" }
  ]
}
</dust-demo-json>
</dust-demo>

## Math Helper

Another handy helper is the `@math` helper. It allows you to take different courses of action based on the result of a mathematical expression. You provide it the lefthand operand using the `key` attribute, the operation to perform using the `method` attribute, and the righthand operand using the `operand` attribute. Then you can nest logical operators within the `@math` tag to test the result of the `@math` helper. For example, we can combine a loop's `$idx` with the `@math` helper to add a class to every other item in a list:

<dust-demo template-name="helpers-math">
<dust-demo-template>
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

<!-- TODO update link -->
A full list of values that the `method` attribute can take is found in the [Syntax documentation](/docs/syntax/).

## Printing the Result

To simply output the result of the mathematical expression, use the `@math` helper as a self-closing tag.

<dust-demo template-name="helpers-math-output">
<dust-demo-template>
There is {@math key=100 method="subtract" operand=progress/}% left to do.
</dust-demo-template>
<dust-demo-json>
{
  "progress": 70
}
</dust-demo-json>
</dust-demo>
