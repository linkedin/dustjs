---
title: Compiling and Rendering
layout: guides
permalink: /guides/rendering/
---

In the [Getting Started](/guides/getting-started/) guide, you learned how to write Dust templates. Now, let's look at how to use your templates to render pages.

## Compile, Load, and Render

  * Before you can use your template, it must be compiled into a Javascript function.
  * After you've gotten a compiled template, you need to register it with Dust so you can refer to it by name.
  * Finally, you can use the template's name to render or stream it to the client.

**Warning:** Compiling a template is much slower than rendering it, so when it's time to deploy to production, you should precompile your templates as part of your build process.

We'll look at how to compile, load, and render templates in several different ways.

### Browser: Basic

**Warning:** Although compiling directly in the browser can be useful during development, you should not do it on your live site or pages will render slowly.

In addition, access to the functions `dust.compile` and `dust.renderSource` in the browser requires that you include `dust-full.js`, which is larger than `dust-core.js`.

```js
<script type="text/dust" id="hello">Hello {world}!</script>
<script type="text/javascript">
var src = document.getElementById('hello').textContent;
// Compile the template under the name 'hello'
var compiled = dust.compile(src, 'hello');
// Register the template with Dust
dust.loadSource(compiled);
// Render the template
dust.render('hello', { world: "Earth" }, function(err, out) {
  // `out` contains the rendered output.
  document.getElementById('output').textContent = out;
});
</script>
```

As a shortcut, you can use `dust.renderSource`:

```js
// compiles, loads, and renders
dust.renderSource(src, { world: "Alpha Centauri" }, function(err, out) { ... });
```

As of Dust 2.7.0, a template name is optional when compiling a template. `dust.loadSource` will return a template function that you can pass directly to `dust.render`.

```js
var compiled = dust.compile(src);
var tmpl = dust.loadSource(compiled);
dust.render(tmpl, { world: "Betelgeuse" }, function(err, out) { ... });
```

### Browser: Precompiled Templates

```js
<!-- precompiled templates -->
<script type="text/javascript" src="/lib/templates.js"></script>
<script type="text/javascript">
// The templates are already registered, so we are ready to render!
dust.render('hello', { world: "Saturn" }, function(err, out) {
  document.getElementById('output').textContent = out;
})
</script>
```

### Browser: AMD (Require.js)

First, read the guide on [loading Dust as an AMD module](http://localhost:4000/guides/setup/#amd). You must have Dust version 2.6.0 or higher.

You can compile your templates as AMD modules by setting `dust.config.amd` to `true`. The easiest way to create AMD templates is by using `dustc` with the `--amd` flag. (To learn how to use `dustc`, see the [`dustc` docs](/docs/dustc-api).)

If a template is not included via `require`, Dust will attempt to load it by passing the template's name to `require`. To make use of this feature, templates should be compiled with names that an AMD loader would expect. For example, a template located at `tmpl/home/main.js` must be named `tmpl/home/main` for Dust to load it correctly. If you use the `dustc` compiler this is handled for you.

```js
<script src="r.js"></script>
<script type="text/javascript">
    define.amd.dust = true;
    require(["lib/dust-core"], function(dust) {
      dust.render('tmpl/hello', { world: "Jupiter" }, function(err, out) {
        // dust will call `require(['tmpl/hello'])` since that template isn't loaded yet
      });
    });
</script>
```

You can preload templates by calling `require` yourself. As of Dust 2.7.0, you can pass the template object directly to `dust.render` instead of a template name.

```js
require(["lib/dust-core", "tmpl/hello"], function(dust, helloTemplate) {
  // Dust >= 2.6.0
  dust.render('tmpl/hello', { world: "Mars" }, function(err, out) { ... });
  // Dust >= 2.7.0
  dust.render(helloTemplate, { world: "Pluto" }, function(err, out) { ... });
})
```

### Node: Basic

**Warning:** Although compiling directly on the server can be useful during development, you should not do it on your live site or pages will render slowly.

```js
var src = fs.readFileSync('/views/hello.dust', 'utf8');
var compiled = dust.compile(src, 'hello');
dust.loadSource(compiled);
dust.render('hello', { world: "Venus" }, function(err, out) {
  // `out` contains the rendered output.
  console.log(out);
});
```

### Node: Using `onLoad`

Dust doesn't care how you load your templates-- they could be stored on an entirely different server if you wanted. You can tell Dust how to load templates it doesn't know about by creating a function called `dust.onLoad`. When a template hasn't been registered yet, Dust will call this function and try to load it.

```js
// Example 1: compiling on-demand
// This is only slow for the first person to request the template since Dust caches it afterwards
dust.onLoad = function(templateName, callback) {
  // `templateName` will contain the name passed to `dust.render`
  // Passing the template source to the callback will compile and register the template for you
  fs.readFile('/views/' + templateName + '.dust', 'utf8', callback);
}
dust.render('hello', { world: "Mercury" }, function(err, out) {
  // /views/hello.dust will get magically loaded and compiled for us!
});
```

```js
// Example 2: fetching a precompiled template
// Dust can compile to CommonJS modules as of Dust 2.7.0
// Use `dustc --cjs`
dust.onLoad = function(templateName, callback) {
  require('/views/' + templateName + '.js')(dust);
  // The precompiled template is ready to go! Just call the callback to tell Dust it's loaded
  callback();
}
dust.render('hello', { world: "Neptune" }, function(err, out) {
  // /views/hello.js will be loaded. It's already compiled and is ready to use.
});
```

## Disable Caching

Once Dust has registered a template, it won't try to load it again. This is great for performance, but makes it hard to make changes to a template and reload to see them.

As of Dust 2.7.0, you can set `dust.config.cache` to `false` to disable the cache in development, so Dust will try to reload the template every time.

## Dust and Express.js

Many developers want to use Dust to render pages from their Node server using [Express](http://expressjs.com). There are several Express rendering engines for Dust that handle template loading, compiling, and caching for you. Among them are:

  * [Adaro](http://npmjs.com/package/adaro), part of the [Kraken](http://krakenjs.com/) framework
  * [Hoffman](http://npmjs.com/package/hoffman), with good support for streaming
  * [klei-dust](http://npmjs.com/package/klei-dust), which supports relative paths for partials
  * [consolidate](https://www.npmjs.com/package/consolidate), which also supports many other engines

## Precompiling Templates

If you're not using an Express view engine, the best way to use Dust is to compile templates as part of your build process. Some of the most common ways to accomplish this are:

  * Using [`dustc`, the command-line compiler](/docs/dustc-api) (with the `--watch` option during development)
  * Using a [Grunt](http://gruntjs.com) plugin like [grunt-dustjs](https://github.com/STAH/grunt-dustjs)
  * Using a [Gulp](http://gulpjs.com) plugin like [gulp-dust](https://www.npmjs.com/package/gulp-dust)
