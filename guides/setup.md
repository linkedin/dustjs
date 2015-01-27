---
title: DustJS | Setup
layout: guides
permalink: /guides/setup/
---

# Installing Dust

## npm

To install as a Node module:

```
npm install --save dustjs-linkedin
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

As of Dust 2.5.2, you can load Dust using an AMD-compatible loader such as require.js.

To maintain backwards compatibility, you must enable a config flag to tell Dust to register itself as a named AMD module ([in the same way jQuery works](http://requirejs.org/docs/jquery.html)).

    define.amd.dust = true;

After you've done this, you can use the module names `dust` or `dust-core` to load Dust, and `dust-full` to load Dust plus the compiler.

    <script src="r.js"></script>
    <script type="text/javascript">
        define.amd.dust = true;
        require(["dust-full"], function(dust) {
            dust.render(...);
        });
    </script>

### Custom require path

Because Dust registers itself as a named module, you cannot pass a path to `require`:

    // Does not work
    require('lib/dust/dust-full', function(dust) {

Instead, you can set a custom path for Dust using `require.config`:

    <script src="r.js"></script>
    <script type="text/javascript">
        require.config({
            paths: {
                "dust-full": "lib/dust/2.5.1/dust-full"
            }
        });
        define.amd.dust = true;
        require(["dust-full"], function(dust) {
            dust.render(...);
        });
    </script>

### Helpers

If you are using `dustjs-helpers` 1.5.1 or newer, the helpers also register themselves as an anonymous AMD module.

    define.amd.dust = true;
    require(["dust", "path/to/dust-helpers"], function(dust) {
        // dust helpers are available when you call dust.render()
    });
