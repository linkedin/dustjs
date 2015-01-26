---
title: DustJS | Getting Started
layout: guides
permalink: /guides/advanced-topics/
---

#Advanced Topics

##Compiling on the server

When performance is a concern, It is reccomended to pre-compile all of your templates on the server rather than the client for two main reasons.

* The compiler engine is about 3 times larger in size than the render engine, so you will save about 25kb on each page load.
* Compiling a template is magnitudes slower than just rendering it.

The compiler is written in javascript and the parser relies on pegjs.  Using nodejs, you can use the normal dust.compile API to build your templates.  A server written in Java has the option of using [Nashorn](http://www.oracle.com/technetwork/articles/java/jf14-nashorn-2126515.html), which is a javascript engine in the JVM.  If you use a command line based build tool, you can use dustc to compile your templates.

##Rendering on the server

If performance is an even bigger concern, you may consider rendering your templates on the server as well.  This means that the server will send down full HTML pages to the client, instead of sending down the compiled template and the json data that the template will consume.
