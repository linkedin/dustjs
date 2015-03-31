---
title: Advanced Topics
layout: guides
permalink: /guides/advanced-topics/
---

## Compiling on the server

When performance is a concern, precompile your templates on the server rather than the client.

* The compiler engine is about 3 times larger in size than the render engine, so you will save about 25kb on each page load.
* Compiling a template is magnitudes slower than just rendering it.

The compiler is written in Javascript. Using Node.js, you can use the normal dust.compile API to build your templates, and cache them in memory. A server written in Java has the option of using <a href="http://www.oracle.com/technetwork/articles/java/jf14-nashorn-2126515.html" target="_blank">Nashorn</a>, which is a Javascript engine in the JVM.

If you use a command-line build tool, you can use the built-in command-line compiler, `dustc`, to compile your templates.

## Rendering on the server

If performance is an even bigger concern, you may consider rendering your templates on the server as well.  This means that the server will send down full HTML pages to the client, instead of sending down the compiled template and the json data that the template will consume. This is mostly a concern for mobile browsers. The downside of this approach is that you cannot rerender templates with new data on the client.
