---
title: DustJS by LinkedIn
layout: default
permalink: /about/
---

What is Dust
-------
Dust is an asynchronous Javascript templating engine.

Why use Dust vs ...?
------
* Asynchronous - Dust templates promote writing non-blocking asynchronous code. The rendering of templates is asynchronously by default and an API is provided so that custom helpers can be written asynchronously as well. If you are writing complex helpers or are looking into deferred loading, deferred compilation, the async nature of Dust will allow these to run as the template renders.
* Streaming - Dust allows templates to be flushed in user defined chunks. If you are writing code that stitches together data from multiple JSON endpoints, you'll find this feature amazing.
* * Browser and server supports - Dust works where Javascript works. In addition to the browser and node environments, we strive to support Rhino, V8 and Nashorn.
* * Composable - support for partials and blocks out of the box.
* * Format friendly - while html generation is typically what is desired, developers work with plenty of other complementary formats like Javasript, JSON, CSS etc. Dust filters provide encoding in many formats and is configurable and extensible for many more.
*
