---
title: DustJS | Getting Started
layout: guides
permalink: /guides/tips-and-tricks/
---

#Tips and Tricks

* There are a set of basic [core helpers](https://github.com/linkedin/dustjs-helpers) available to include in your project.
* You can run this [dust linter](https://github.com/smfoote/Swiffer.js) to get warned while you are writing templates about possible security holes, parse errors, coding style guidelines, etc.
* Debugging can be turned on by setting dust.debugLevel to one of 4 values: "DEBUG", "INFO", "WARN", "ERROR" before your render/renderSource/stream calls.  "DEBUG" will not filter out any log messages, while every level above will filter out logs below them in severity.
