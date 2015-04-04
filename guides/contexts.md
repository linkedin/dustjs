---
layout: guides
title: Contexts
permalink: /guides/contexts/
---

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
Dust can search upwards: {foo}{~n}
But, it can't search up and then down: {two}{~n}
So you need to search up, and then start a new search: {#one}{two}{/one}{~n}
Or, you can search up, and then do a dotted lookup: {one.two}
</dust-demo-template>
<dust-demo-json>(function() {

var context = dust.makeBase();
var newContext = context.push({ "foo": "bar", "one": { "two": "Hello!" } })
                        .push("level2")
                        .push("level3")
                        .push("level4")
                        .push("this one gets popped off");

newContext.pop();

return newContext;

})()</dust-demo-json>
</dust-demo>

## Global Context

When creating a context, you can provide a second "global" context that is always accessible, no matter where Dust is in the stack. To add a global context, pass a value to `dust.makeBase` to create a Context object. Then, pass that Context object to `dust.render`.

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

Objects, Arrays, strings, numbers, and other literals are retrieved from the context as-is. Dust treats other context values specially:

### Functions

Instead of returning a function to be rendered by the template, Dust first executes the function and passes its return value to the template. The function is invoked with some special Dust parameters to give it great control over the rendering process.

These special functions are collectively referred to as **context helpers**. For information on how to write context helpers, see the [Context Helpers guide](/guides/context-helpers).

### Promises (Dust 2.6.2)

As of Dust 2.6.2, when Dust encounters a Promise in the context, it waits for the Promise to be resolved or rejected before providing the value to the template.

If the Promise is a reference, it is output directly. If the Promise is rejected, the reference does not output.

If the Promise is a section, its return value is pushed onto the context stack. If the Promise is rejected, Dust looks for an `{:error}` block in the section and renders that instead.

You can even refer directly to keys in the eventual return value of a Promise, even if the Promise has yet to resolve.

**Note:** Dust requires Promises you provide in your context to be [Promises/A+-compliant](https://github.com/promises-aplus/promises-spec/blob/master/implementations.md) with respect to their `.then` method. For example, versions of jQuery prior to 1.8 do not provide compliant Promises and cannot be used properly with Dust.

<dust-demo templateName="promise">
  <dust-demo-template showTemplateName="true">
    Your IP address is {jsonTest.ip}
  </dust-demo-template>
  <dust-demo-json>
{
  "jsonTest": $.getJSON("http://ip.jsontest.com/")
}
  </dust-demo-json>
</dust-demo>

### Streams (Dust 2.7.0)

As of Dust 2.7.0, Dust can read from Node-like Streams in the context. When Dust finds a Stream, it attaches `data`, `error`, and `end` listeners.

A Buffer- or string-based Stream can be accessed in the template as a reference or a section. An Object-based Stream should only be accessed as a section.

When a Stream is accessed as a section, Dust flushes each iteration immediately upon completion. This is useful if you are streaming out a large amount of data, since the browser can begin rendering the response immediately (in conjunction with `dust.stream`). Otherwise, Dust waits for the `end` event to fire before flushing the chunk.

If a Stream never emits an `end` or `error` event, the template will never finish rendering. Depending on your Stream implementation, you may wish to safeguard against a poorly-written stream by forcefully ending the stream after a timeout.
