---
title: DustJS | Getting Started
layout: guides
permalink: /guides/using-helpers/
---

# Using Helpers

Helpers are extensions added to Dust to increase its functionality. They make it possible for anyone to extend the way Dust works. They are commonly used to add functionality related to things like logic, formatting, and internationalization. Helpers are denoted by the `@` symbol. Let's take a look at some commonly used helpers.

## Installing Helpers

Helpers are bundled separately as the `dustjs-helpers` library. After the dustjs-linkedin library is loaded, follow the same instructions in the [Getting Started guide](/guides/getting-started/) to install `dustjs-helpers`. If you are cloning or downloading from GitHub, you can find the helpers in the [dustjs-helpers repository](https://github.com/linkedin/dustjs-helpers).

If you are using node.js, then the following `require` statements will ensure you have the needed Dust modules available.

```
require('dustjs-linkedin');
require('dustjs-helpers');
```

## Logic Helpers

The helpers library comes with the following logic helpers: `{@eq}`, `{@ne}`, `{@gt}`, `{@lt}`, `{@gte}`, and `{@lte}`. These helpers allow you to print content if one value compared in a certain way (e.g. equal, greater than or equal to) to another value is true. For each helper, you specify the first value with the `key` attribute and the second value with the `value` attribute. Both `key` and `value` can point to a reference or a literal value. Wrap literal values in quotes and leave references un-quoted.

In the following example, the first helper looks for the value of `level` in the underlying JSON data and checks if it is equal to the literal string "master". The second checks to see if the value for the `age` reference is greater than the value of the `carRentalAge` reference.

<dust-demo template-name="helpers-logic">
<dust-demo-template>
{@eq key=level value="master"}You are no longer a Padawan. {/eq}
{@gt key=age value=carRentalAge}Rent a Car!{/gt}
</dust-demo-template>
<dust-demo-json>
{
  "level": "master",
  "age": 27,
  "carRentalAge": 25
}
</dust-demo-json>
</dust-demo>

### Else

You can use an `{:else}` clause to do something if the comparison is false.

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

If you are comparing a literal value to one that you know is not a string (e.g. a number or a boolean), make sure to specify the `type` attribute so Dust knows how to cast the literal value.

<dust-demo template-name="helpers-casting">
<dust-demo-template>
{! Convert "18" to a number before comparing !}
{@gte key=age value="18" type="number"}You can vote!{/gte}
</dust-demo-template>
<dust-demo-json>
{
  "age": 20
}
</dust-demo-json>
</dust-demo>

## Select Helper

The `@select` helper can be combined with the other logic helpers to form a `switch`-like structure, allowing you to take one action based on multiple comparisons with a single key value. You move the `key` attribute to `@select` and wrap the helper around the comparisons, specifying only a `value` attribute for each one. Each condition will be tested until one is true. When a true condition is
found, Dust executes the condition's body and skips the rest of the conditions. You can specify what to do if none of the conditions are true using the `@default` helper.

<dust-demo template-name="helpers-select">
<dust-demo-template>
{@select key=bilbosAge}
  {@lt value=gandalfsAge}Indeed, Bilbo is younger than Gandalf.{/lt}
  {@eq value=gandalfsAge}Bilbo and Gandalf are the same age.{/eq}
  {@gt value=gandalfsAge}Wait, Bilbo is older than Gandalf?!{/gt}
  {! default can catch when gandalfsAge is undefined !}
  {@default}Gandalf's age is a conundrum.{/default}
{/select}
</dust-demo-template>
<dust-demo-json>
{
  "bilbosAge": 50,
  "gandalfsAge": 12345
}
</dust-demo-json>
</dust-demo>

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
