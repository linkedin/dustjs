---
title: Dust.js | Setup
layout: guides
permalink: /guides/setup/
---

# Installing Dust

## npm

To install as a Node module:

```
npm install --save dustjs-linkedin

# If you want the core helpers addon
npm install --save dustjs-helpers
```

Dust should work with any version of Node or io.js newer than 0.8.12.

The command-line compiler is located at `./node_modules/.bin/dustc`. To make the compiler available globally, run `npm install` with the `-g` flag.

## Bower

To install using Bower:

```
bower install dustjs-linkedin
```

Dust is compatible with IE7+ and all modern browsers.

## Download

The latest version of Dust is available on <a target="_blank" href="https://github.com/linkedin/dustjs/tree/master/dist">GitHub</a>.

# Loading Dust

## Node

```
var dust = require('dustjs-linkedin');
```

## Browser

Include `dust-core.min.js` or `dust-full.min.js` on your page. If you will be compiling templates in the browser, use `dust-full.min.js`.

## AMD

As of Dust 2.6.0, you can load Dust using an AMD-compatible loader such as require.js.

To maintain backwards compatibility, you must enable a config flag to tell Dust to register itself as a named AMD module ([in the same way jQuery works](http://requirejs.org/docs/jquery.html)).

    define.amd.dust = true;

After you've done this, you can load `dust-core.js` or `dust-full.js` as a module.

    <script src="r.js"></script>
    <script type="text/javascript">
        define.amd.dust = true;
        require(["lib/dust-full"], function(dust) {
            dust.render(...);
        });
    </script>

### Helpers

If you are using `dustjs-helpers` 1.6.0 or newer, the helpers also register themselves as an anonymous AMD module. It seems to work best if you require the helpers after Dust has already been loaded.

```js
define.amd.dust = true;
require(["lib/dust-full"], function(dust) {
  require(["lib/dust-helpers"], function() {
    // dust helpers are available when you call dust.render()
  });
});
```

### Templates

You can also compile your templates as AMD modules. Before compiling a template, set

    dust.config.amd = true

You can preload your templates using Require by including a template file as a dependency.

```js
define.amd.dust = true;
require(["lib/dust-full", "tmpl/compiled"], function(dust) {
    // tmpl/compiled contains several compiled templates
    dust.render("hello", ...); // render one of the templates in tmpl/compiled
});
```

If a template is not preloaded, Dust will attempt to `require` it by passing the template's name to `require`. To make use of this feature, templates should be compiled with names that an AMD loader would expect. For example, a template located at `tmpl/home/main.dust` must be named `tmpl/home/main` for Dust to load it correctly. If you use the `dustc` compiler this is handled for you.
