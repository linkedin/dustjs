---
layout: guides
title: Dust.js | Contexts
permalink: /guides/contexts/
---

# Contexts

Dust refers to the data used to render a template as a **context**. The context is modelled as a **stack** of Javascript objects, arrays, and literals. Dust can search multiple layers of the stack, popping off the top objects and looking below.

In this example, notice how Dust moves "up" the context stack.

  - The context is set to a single child inside the `{#children}` section.
  - Dust finds the child's `firstName` at that context level.
  - Dust can't find a `lastName` at the child's context level, so it moves up one level and searches again.

<dust-demo templateName="search-upwards">
<dust-demo-template showTemplateName="true">
Parent: {firstName} {lastName}{~n}
Children: {#children}{firstName} {lastName} {/children}
</dust-demo-template>
<dust-demo-json>{
  "firstName": "John",
  "lastName": "Smith",
  "children": [
    { "firstName": "Alice" },
    { "firstName": "Bobby" },
    { "firstName": "Charlie" }
  ]
}</dust-demo-json>
</dust-demo>

## Pushing and Popping Context

You may add a new level of context to the top of the context stack by using `context.push`. The existing context **is not modified**. Instead, pushing returns a new context.

As of Dust 2.6.2, `context.pop` removes the topmost level of the context and returns it.
The existing context **is modified**.

The special reference `{.}` always refers to the current context.

<dust-demo templateName="push">
<dust-demo-template showTemplateName="true">
Current context: {.}{~n}
Other levels are available: {foo}
</dust-demo-template>
<dust-demo-json>(function() {

var context = dust.makeBase();
var newContext = context.push({ "foo": "bar" })
                        .push("a string")

return newContext;

})()</dust-demo-json>
</dust-demo>

## Global Context

When creating a context, you can provide a second "global" context that is always accessible, no matter where Dust is in the stack. To add a global context, pass a value to `dust.makeBase`, instead of passing a plain object to `dust.render`.

The global context is the lowest level of the stack, so it will be shadowed by any references that are defined at a higher level.

<dust-demo templateName="global">
<dust-demo-template showTemplateName="true">
Hello {global} {name}!{~n}
{#friend}Hello {global} {name}!{/friend}
</dust-demo-template>
<dust-demo-json>(function() {

var context = dust.makeBase({ "global": "global", "name": "World" });

return context.push({
  "friend": {
    "name": "Dusty"
  }
});

})()</dust-demo-json>
</dust-demo>

## Special Values in Context

Objects, Arrays, strings, numbers, and other literals are retrieved from the context as-is. Contexts have special behavior when returning functions.

### Functions

Instead of returning a function to be rendered by the template, Dust first executes the function and passes its return value to the template. The function is invoked with some special Dust parameters to give it great control over the rendering process.

These special functions are collectively referred to as **context helpers**. For information on how to write context helpers, see the [Context Helpers guide](/guides/context-helpers).
