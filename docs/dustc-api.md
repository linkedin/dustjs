---
layout: docs
title: dustc
permalink: /docs/dustc-api/
---

# dustc post-2.6

For Dust 2.6, the compiler has been rewritten to act more like a Linux binary. You can pipe in and out of the compiler, and compile whole directory trees at once.

```
$ dustc [options] [path1 [path2 path3...]]
```

For example, to compile all templates in the directory `tmpl` to `output.js`:

```
$ dustc tmpl/**/*.dust -o output.js
# Or using redirection
$ dustc tmpl/**/*.dust > output.js
```

To compile a few templates to AMD modules in-place:

```
$ dustc -as tmpl/one.dust tmpl/two.dust
```

### `-n, --name`

Register the compiled template under this name in the Dust cache. This is the name that you'll pass to `dust.render()` to render the template. If you're compiling more than one template, this parameter has no effect.

### `-o, --output`

Collect all compiled template output in this file. If you use AMD registration, the file will contain multiple named AMD modules that will all be available once you require the file.

### `-s, --split`

Create one output file for every input file. Output files will end in `.js` and have the same filename as the input file. Output files register themselves with Dust using their path. For example, compiling `tmpl/foo/bar.dust` would create `tmpl/foo/bar.js` that registers itself as `tmpl/foo/bar`.

**Note:** Names are always created with forward slashes for compatibility with AMD loaders, even if you run dustc on Windows.

### `--pwd`

Strips a prefix from all generated template names. For example, if you tried to compile all templates inside `app/lib/tmpl/` but you wanted to refer to them as `tmpl/foo`, you could pass `--pwd=app/lib`

### `-w, --whitespace`

Toggles `dust.config.whitespace`. If true, the template will be compiled such that whitespace will be preserved in the rendered output.

### `-a, --amd`

Compiles templates as AMD modules.

### `--watch`

Reruns the compilation if any of the watched files change. (If you add a new file, you must restart the watch.)


# dustc pre-2.6

```
$ dustc [{-n|--name}={template_name}] {inputfilename} [{outputfilename}]
```

For example, to compile a template on the command line and have it registered under the same name as the source file:

```
$ dustc input.tl template.html
```

You can customize the name under which the template is registered by using the "name" option:

```
$ dustc --name=mytemplate input.tl template.html
```
