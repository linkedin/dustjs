## Change Log

### v2.7.5 (2016/12/09 13:49 +00:00)
- [#756](https://github.com/linkedin/dustjs/pull/756) Decrease security vulnerabilities by upgrading cli dependency (#754 #748) (@danactive)

### v2.7.4 (2016/09/13 02:52 +00:00)
- [#744](https://github.com/linkedin/dustjs/pull/744) Don't use instanceof to determine if a Context is a Context. Instead use a flag on the instance itself so it can survive object merges. (@sethkinast)

### v2.6.3 (2016/07/26 18:03 +00:00)
- [#736](https://github.com/linkedin/dustjs/pull/736) Prioritize resolution of .then (@brianmhunt)
- [#734](https://github.com/linkedin/dustjs/pull/734) Bump deps (@sethkinast)
- [#703](https://github.com/linkedin/dustjs/pull/703) Upgrade to peg.js 0.9 (@sethkinast)
- [#705](https://github.com/linkedin/dustjs/pull/705) When rendering with a Context object, use the templateName provided by the template (@sethkinast)
- [#701](https://github.com/linkedin/dustjs/pull/701) Fix stacktrace logging for IE8 (@sethkinast)
- [#700](https://github.com/linkedin/dustjs/pull/700) At `DEBUG` loglevel, log the full stack trace on errors (@r1b)
- [#690](https://github.com/linkedin/dustjs/pull/690) Update deps (@sethkinast)
- [#689](https://github.com/linkedin/dustjs/pull/689) Make the AMD loader pass the template directly rather than communicating via the cache (@aredridel)

### v2.7.2 (2015/06/08 20:41 +00:00)
- [#673](https://github.com/linkedin/dustjs/pull/673) Pass the current context to filters (@sethkinast)
- [#676](https://github.com/linkedin/dustjs/pull/676) If a Promise is resolved with an array, iterate over it instead of rendering the whole array at once.  Closes #674 (@sethkinast)
- [#647](https://github.com/linkedin/dustjs/pull/647) Allow helpers to return primitives  Previously returning a primitive would crash rendering with no way to recover. You can still return a Chunk and do more complex work if you need to.  Helpers act like references or sections depending on if they have a body. When they have no body, they act like a reference and look in `params.filters` for filters to use. When they have a body, they act like a section. You can return thenables and streams normally.  {@return value="<Hello>" filters="|s" /} {@return value="<Hello>"}{.} World{/return}  Closes #645 (@sethkinast)
- [#664](https://github.com/linkedin/dustjs/pull/664) Be slightly pickier about what Dust thinks a Stream is.  Closes #663 (@sethkinast)
- [#661](https://github.com/linkedin/dustjs/pull/661) Add saucelabs integration (@sethkinast)
- [#658](https://github.com/linkedin/dustjs/pull/658) Refactor testing frameworks  Closes #649  Closes #602  Closes #642 (@sethkinast)
- [#660](https://github.com/linkedin/dustjs/pull/660) Grammar: s/char/character/ to avoid using a reserved name  Closes #659 (@sethkinast)

### v2.7.1 (2015/04/30 20:32 +00:00)
- [#655](https://github.com/linkedin/dustjs/pull/655) Update CommonJS example to make use of new onLoad behavior (@sethkinast)
- [#653](https://github.com/linkedin/dustjs/pull/653) Fix array iteration when context is undefined (@sethkinast)
- [#641](https://github.com/linkedin/dustjs/pull/641) Add a `cb(null, compiledTemplate)` signature to `dust.onLoad`  Calling the `onLoad` callback with a compiled template function will use this template to satisfy the load request. The template is not automatically registered under any name when passed to the callback, so the `onLoad` function should handle registration as it needs.  `dust.cache` behavior has been changed slightly. Before, setting it to false would blow away the entire cache on every render. Now, setting it to false just prevents new templates from being added and cached templates from being used, but if it's set to true again previously-cached templates will be ready to use. (@sethkinast)
- [#650](https://github.com/linkedin/dustjs/pull/650) Pin jasmine@2.2.x for grunt-jasmine-nodejs (@sethkinast)
- [#646](https://github.com/linkedin/dustjs/pull/646) Update AMD and CommonJS examples (@sethkinast)
- [#637](https://github.com/linkedin/dustjs/pull/637) CommonJS example (@sethkinast)
- [#638](https://github.com/linkedin/dustjs/pull/638) Preserve compiler backwards compatibility with pre-2.7 versions (@sethkinast)
- [#639](https://github.com/linkedin/dustjs/pull/639) Fix failing test on Windows (@sethkinast)

### v2.7.0 (2015/04/17 23:23 +00:00)
- [#636](https://github.com/linkedin/dustjs/pull/636) Fix failing tests in IE8 (@sethkinast)
- [#633](https://github.com/linkedin/dustjs/pull/633) Drop Node 0.8 (@sethkinast)
- [#635](https://github.com/linkedin/dustjs/pull/635) Resolve dynamic partial names via original context (@sethkinast)
- [#631](https://github.com/linkedin/dustjs/pull/631) Try to avoid creating Stacks with no content when possible (@sethkinast)
- [#613](https://github.com/linkedin/dustjs/pull/613) Refactor template compilation  * `dust.render` and `dust.stream` now accept a compiled template function in addition to a template name. * `dust.compile` no longer requires a template name, and will compile an anonymous template without one (so `--name` is no longer required for dustc either) * `dust.load` is removed from the public API * `dust.renderSource` is moved to the compiler, so it's only included in dust-full now (Fixes #412) * `dust.compileFn` is moved to the compiler, so it's only included in dust-full now * add `dust.isTemplateFn` * add `dust.config.cache = true`, set to `false` to disable caching and load templates again every time (Fixes #451) * add `dust.config.cjs = false`, set to `true` to compile templates as CommonJS modules * add `--cjs` flag to `dustc` * Move a bunch of exposed compiler stuff under `dust.compiler` (but leave it exposed until 2.8) (@sethkinast)
- [#624](https://github.com/linkedin/dustjs/pull/624) dustc always creates templates with forward slashes (@sethkinast)
- [#617](https://github.com/linkedin/dustjs/pull/617) Add `chunk.stream` to allow streamables in context (@sethkinast)
- [#610](https://github.com/linkedin/dustjs/pull/610) clean up PEG grammar a little bit (@sethkinast)
- [#622](https://github.com/linkedin/dustjs/pull/622) Fix behavior of `Context#resolve` when resolving a context function that returns a Chunk (@sethkinast)
- [#611](https://github.com/linkedin/dustjs/pull/611) Add grunt-github-changes plugin to automatically update changelog before releases (@sethkinast)
- [#627](https://github.com/linkedin/dustjs/pull/627) Move to Travis CI Container builds (@sethkinast)
- [#623](https://github.com/linkedin/dustjs/pull/623) Update to stable chokidar. (@paulmillr)
- [#592](https://github.com/linkedin/dustjs/pull/592) Remove benchmark and old docs (@sethkinast)
- [#609](https://github.com/linkedin/dustjs/pull/609) Clarify a few examples and add a new explicitly-incremental streaming example (@sethkinast)

### v2.6.2 (2015/03/26 20:28 +00:00)
- [#593](https://github.com/linkedin/dustjs/pull/593) npm upgrade (@sethkinast)
- [#590](https://github.com/linkedin/dustjs/pull/590) Add deep resolution of Thenables in context (@sethkinast)
- [#583](https://github.com/linkedin/dustjs/pull/583) Move lib/server to index (@sethkinast)
- [#587](https://github.com/linkedin/dustjs/pull/587) Allow Rhino test failures to break the build (and fix a test typo that broke Rhino) (@sethkinast)
- [#582](https://github.com/linkedin/dustjs/pull/582) Refactor main Dust module's global context (@sethkinast)
- [#579](https://github.com/linkedin/dustjs/pull/579) Clean up / refactor logging (@sethkinast)
- [#569](https://github.com/linkedin/dustjs/pull/569) Thenable support (@sethkinast)
- [#578](https://github.com/linkedin/dustjs/pull/578) Add --watch support to dustc (@sethkinast)
- [#577](https://github.com/linkedin/dustjs/pull/577) Adding examples! (@sethkinast)
- [#559](https://github.com/linkedin/dustjs/pull/559) Add `context.clone` and `context.pop` and simplify chunk.partial. (@sethkinast)
- [#555](https://github.com/linkedin/dustjs/pull/555) Add Context#resolve (@sethkinast)

### v2.6.1 (2015/03/11 23:38 +00:00)
- [#557](https://github.com/linkedin/dustjs/pull/557) Fix the output of format (whitespace-only) blocks inside inline partials (@sethkinast)
- [#546](https://github.com/linkedin/dustjs/pull/546) Add Travis test targets for node 0.12 and iojs (@sethkinast)
- [#552](https://github.com/linkedin/dustjs/pull/552) Update bower file (@sethkinast)
- [#550](https://github.com/linkedin/dustjs/pull/550) Core grammar: support negative numbers passed as params (@jasonbelmonti)

### v2.6.0 (2015/03/05 01:30 +00:00)
- [#545](https://github.com/linkedin/dustjs/pull/545) New dustc compiler.  This breaks backward compat, but allows streaming output and a usage manual.  Also includes tests that were nonexistent previously. (@sethkinast)
- [#536](https://github.com/linkedin/dustjs/pull/536) Add AMD (require.js) compatibility.  This includes the core, compiler, parser, and support for compiling templates as AMD modules.  Have to set define.amd.dust to true to allow dust to be loaded as an AMD module, and dust.config.amd to true to compile templates as AMD modules. (@sethkinast)
- [#543](https://github.com/linkedin/dustjs/pull/543) dustc: replace util.print/util.puts with console.log (@hunterchristian)
- [#541](https://github.com/linkedin/dustjs/pull/541) Escape template names in case they contain non-JS-safe characters (@aredridel)
- [#540](https://github.com/linkedin/dustjs/pull/540) escape values (\u2028, \u2029 and <) when using json filter (@jimmyhchan)
- [#534](https://github.com/linkedin/dustjs/pull/534) Stringify things before calling escapeHtml on them in case their stringified representation contains HTML (@sethkinast)
- [#537](https://github.com/linkedin/dustjs/pull/537) Stop archiving old releases (@sethkinast)
- [#533](https://github.com/linkedin/dustjs/pull/533) Add dust.version and bump it during grunt-bump (@sethkinast)
- [#529](https://github.com/linkedin/dustjs/pull/529) Fix hanging comma in dust.config. Fixes IE7. (@jrrbru)
- [#526](https://github.com/linkedin/dustjs/pull/526) Don't stringify dust.log messages (@sethkinast)

### v2.5.1 (2014/11/20 01:08 +00:00)
- [#522](https://github.com/linkedin/dustjs/pull/522) Fix the use of a multi-level object key (e.g. foo.bar) as the key for an index lookup inside non-self-closing tags. (@sethkinast)
- [#520](https://github.com/linkedin/dustjs/pull/520) Update changelog to 2.5.0 (@sethkinast)

### v2.5.0 (2014/11/04 00:15 +00:00)
- [#515](https://github.com/linkedin/dustjs/pull/515) Remove the warning log when you attach a new Stream event (@sethkinast)
- [#513](https://github.com/linkedin/dustjs/pull/513) Treat compiled body functions as blocks to render instead of functions to evaluate.   Dust body functions are now flagged with .___dustBody to differentiate them from functions set in the context. (@sethkinast)
- [#511](https://github.com/linkedin/dustjs/pull/511) Treat formats and buffers as interchangeable when they are mixed together in order to prevent stack overflows with large templates and add a whitespace flag to dust.config (@sethkinast)
- [#504](https://github.com/linkedin/dustjs/pull/504) Update README formatting (@NickStefan)
- [#503](https://github.com/linkedin/dustjs/pull/503) Update contributors list (@sethkinast)
- [#502](https://github.com/linkedin/dustjs/pull/502) Don't use the regexp constructor since we are using a regexp literal anyway (@jimmyhchan)

### v2.4.2 (2014/09/09 23:11 +00:00)
- [#497](https://github.com/linkedin/dustjs/pull/497) Upgrade to pegJS 0.8 - This change corresponds to a 90% reduction in template compile time. (@sethkinast)

### v2.3.6 (2014/09/09 22:33 +00:00)
- [#495](https://github.com/linkedin/dustjs/pull/495) Catch syntax errors in context and fail gracefully (@sethkinast)

### v2.4.1 (2014/09/02 20:33 +00:00)
- [#494](https://github.com/linkedin/dustjs/pull/494) Revert "Merge pull request #472 from jimmyhchan/OPP"  This will allow dust references to look up the object's prototype chain again. (@sethkinast)
- [#493](https://github.com/linkedin/dustjs/pull/493) Update changelog to 2.4.0 (@prashn64)

### v2.4.0 (2014/06/11 01:32 +00:00)
- [#472](https://github.com/linkedin/dustjs/pull/472) #469 Prevent references from looking in the prototype.    Previously, {arr.sort} was possible even if sort was not a function in the arr object, since it was looking in the Array prototype. (@jimmyhchan)
- [#441](https://github.com/linkedin/dustjs/pull/441) Make default params type to an object instead of null (@prashn64)
- [#447](https://github.com/linkedin/dustjs/pull/447) deprecate the internal property context.isFunction. this is no longer needed. (@prashn64)
- [#424](https://github.com/linkedin/dustjs/pull/424) Set up dev flow with grunt and fix coverage report (@kate2753)
- [#471](https://github.com/linkedin/dustjs/pull/471) Errors thrown from render will now call populate the error in the callback. Previously, thrown errors will immediately fail and not call the callback.  Issue #381,   Address #468: Errors thrown from stream now will invoke the `error` listener with the error object. Previously, these errors could not be caught and the process will hang.  Deprecated/remove: `dust.onError`, `dust.silenceErrors`. To see runtime errors, look at the error in the callback.  breaking change: `dust.log` with an error no longer throws that error (@prashn64)
- [#475](https://github.com/linkedin/dustjs/pull/475) remove config set on before install for travis build (@prashn64)
- [#474](https://github.com/linkedin/dustjs/pull/474) travis build fix for minimatch grunt module (@prashn64)
- [#470](https://github.com/linkedin/dustjs/pull/470) Ensure client bundlers load only client-side code (@patrick-steele-idem)

### v2.3.5 (2014/05/08 21:31 +00:00)
- [#463](https://github.com/linkedin/dustjs/pull/463) Rendering performance improvements by simplifying logging (@kate2753)

### v2.2.10 (2014/05/07 23:39 +00:00)
- [#444](https://github.com/linkedin/dustjs/pull/444) make console.log available for logging statements in node environment by passing the proper global (@bgmort)

### v2.3.4 (2014/03/06 22:34 +00:00)
- [#435](https://github.com/linkedin/dustjs/pull/435) indexInArray fix. (@kate2753)

### v2.1.4 (2014/03/06 00:32 +00:00)
- [#432](https://github.com/linkedin/dustjs/pull/432) add temporary fix for ssl problems with npm until travis itself updates ... (@prashn64)
- [#430](https://github.com/linkedin/dustjs/pull/430) Only have the logger.log call once inside logger.log (@prashn64)
- [#429](https://github.com/linkedin/dustjs/pull/429) Patch 2.1.X 2.2.X 2.3.X to fix IE9 and below issues when dust debugging is on. Added a cross-browser/node/rhino version of indexOf and logger.log. (@kate2753)

### v2.1.3 (2014/02/27 08:18 +00:00)
- [#426](https://github.com/linkedin/dustjs/pull/426) Add changelog (@lalitkapoor)
- [#427](https://github.com/linkedin/dustjs/pull/427) Add 2.2.7 which is identical to 2.2.6 for npm (@prashn64)

### v2.2.7 (2014/02/24 23:06 +00:00)
- [#419](https://github.com/linkedin/dustjs/pull/419) Fix Context.prototype._get to work with context switching when calling partials and make the 2.2.x+ compiler fully backwards compatible. (@kate2753)

### v2.2.6 (2014/02/13 00:18 +00:00)
- [#420](https://github.com/linkedin/dustjs/pull/420) Make the compiler backwards compatible with runtime versions prior to 2.2.x (@kate2753)

### v2.3.3 (2014/01/31 21:29 +00:00)
- [#416](https://github.com/linkedin/dustjs/pull/416) Lower most errors to warnings. (@prashn64)

### v2.3.2 (2014/01/28 01:12 +00:00)
- [#414](https://github.com/linkedin/dustjs/pull/414) Point dustc to the correct version of server dust (@jimmyhchan)

### v2.3.1 (2014/01/19 22:23 +00:00)
- [#408](https://github.com/linkedin/dustjs/pull/408) dust.compileFn no longer requires the name to be defined. (@jimmyhchan)

### v2.3.0 (2014/01/17 00:26 +00:00)
- [#405](https://github.com/linkedin/dustjs/pull/405) Fix Grunt release and don't push upstream by default (safer) (@jimmyhchan)
- [#392](https://github.com/linkedin/dustjs/pull/392) Add Rhino and Rhino unit tests (@kate2753)
- [#404](https://github.com/linkedin/dustjs/pull/404) revert package.json back to 2.2.3 (@prashn64)
- [#403](https://github.com/linkedin/dustjs/pull/403) bump commit does not support tasks (@jimmyhchan)
- [#395](https://github.com/linkedin/dustjs/pull/395) fail hard when a name is not explicitly defined in dust.compile (@prashn64)
- [#399](https://github.com/linkedin/dustjs/pull/399) Don't swallow all errors by default (Issue #381).  Deprecate dust.isDebug and dust.onError. Instead, just use debugLevel and dust.log(message, 'ERROR'), respectively.    Add a dust.silenceErrors flag to swallow all errors. (@prashn64)

### v2.1.1 (2014/01/16 01:09 +00:00)
- [#382](https://github.com/linkedin/dustjs/pull/382) remove the globals and isolate parser and compiler (@jimmyhchan)
- [#334](https://github.com/linkedin/dustjs/pull/334) Issue #332 provide a raw input syntax similar to comments {!...!} where newlines, spaces and braces are kept. (@jimmyhchan)
- [#371](https://github.com/linkedin/dustjs/pull/371) Fix our release process + add bower.json + jshint + cleanup master (@jimmyhchan)

### v2.2.3 (2013/12/06 02:02 +00:00)
- [#374](https://github.com/linkedin/dustjs/pull/374) Properly generate .min files for 2.2.3 (@kate2753)
- [#372](https://github.com/linkedin/dustjs/pull/372) Regenerate dist files for v2.2.3 to include $idx fixes (@kate2753)

### v2.2.2 (2013/11/28 00:10 +00:00)
- [#368](https://github.com/linkedin/dustjs/pull/368) Add context.getTemplateName. This method now correctly returns the template name even for directly loaded templates being used as partials. For end users please use this api for getting the template name instead of ctx.templatename (@prashn64)
- [#363](https://github.com/linkedin/dustjs/pull/363) Issue #340. Remove old optimization to avoid looking at arrays in get. (@rragan)
- [#362](https://github.com/linkedin/dustjs/pull/362) remove node_modules directory (@wizardzloy)

### v2.2.0 (2013/11/08 18:42 +00:00)
- [#360](https://github.com/linkedin/dustjs/pull/360) Use get for all Dust references (@smfoote)

### v2.1.0 (2013/10/25 08:44 +00:00)
- [#350](https://github.com/linkedin/dustjs/pull/350) Support dynamic template names for the context's template name. (@johnsonlei)
- [#355](https://github.com/linkedin/dustjs/pull/355) add a unit test for inline params with dashes (@prashn64)
- [#347](https://github.com/linkedin/dustjs/pull/347) Dust error logging (@prashn64)
- [#344](https://github.com/linkedin/dustjs/pull/344) Per discussions, this may be a bit premature. Revert "Merge pull request #279 from prashn64/master" until the api for debugging is more settled. (@prashn64)
- [#279](https://github.com/linkedin/dustjs/pull/279) Client Side Debugging (@prashn64)

### v2.0.3 (2013/09/06 23:23 +00:00)
- [#338](https://github.com/linkedin/dustjs/pull/338) update to correct  2.0.3 (@prashn64)
- [#335](https://github.com/linkedin/dustjs/pull/335) make context.templateName change into version 2.0.3 (@prashn64)
- [#328](https://github.com/linkedin/dustjs/pull/328) Put templateName on the context instance instead of the context's globals. (@prashn64)
- [#323](https://github.com/linkedin/dustjs/pull/323) Fix Issue #322. block name in template includes previous text by mistake (@rragan)

### v2.0.2 (2013/08/01 20:57 +00:00)
- [#320](https://github.com/linkedin/dustjs/pull/320) Update parser.js to sync with latest dust.pegjs (@smfoote)
- [#319](https://github.com/linkedin/dustjs/pull/319) Clarify comments on path search (@rragan)
- [#318](https://github.com/linkedin/dustjs/pull/318) Fix issue #317. Falsey value at end of path (@rragan)

### v2.0.1 (2013/07/24 17:34 +00:00)
- [#309](https://github.com/linkedin/dustjs/pull/309) Add lines and columns to dust.pegjs (@smfoote)
- [#312](https://github.com/linkedin/dustjs/pull/312) Remove node_modules/jasmine_node (@smfoote)

### v2.0.0 (2013/07/17 02:18 +00:00)
- [#306](https://github.com/linkedin/dustjs/pull/306) add support for GH-292, support the template name in nested partials (@vybs)
- [#305](https://github.com/linkedin/dustjs/pull/305) Remove option to control pathScope and remove tests for old getPath (@rragan)
- [#304](https://github.com/linkedin/dustjs/pull/304) GH-292 support template name in nested partials, need a stack to store the current name (@vybs)
- [#289](https://github.com/linkedin/dustjs/pull/289) Cache VM context across `dust.loadSource` calls. (@totherik)
- [#271](https://github.com/linkedin/dustjs/pull/271) adding support for . path resolution in context get (@carchrae, @rragan)
- [#2](https://github.com/linkedin/dustjs/pull/2) Fixed jasmine testRunner to understand base and options properties (@rragan)

### v1.2.6 (2013/06/06 15:54 +00:00)
- [#278](https://github.com/linkedin/dustjs/pull/278) Remove strip from dust.compile, since it wasn't really very good anyway (@smfoote)

### v1.2.5 (2013/06/02 21:25 +00:00)
- [#274](https://github.com/linkedin/dustjs/pull/274) GH-266 store rendered template in global (@vybs)
- [#263](https://github.com/linkedin/dustjs/pull/263) Add forward slash and unit tests for j filter (@prashn64)

### v1.2.3 (2013/04/11 17:47 +00:00)
- [#253](https://github.com/linkedin/dustjs/pull/253) 2-3000% performance enhancement in IE7 (@jlkonsultab)
- [#249](https://github.com/linkedin/dustjs/pull/249) Remove debugger in dust-full-1.2.1.js (@sethkinast)

### v1.2.2 (2013/03/19 20:07 +00:00)
- [#245](https://github.com/linkedin/dustjs/pull/245) Gh-208 - solve the incorrect error line reported in peg (@jairodemorais)
- [#243](https://github.com/linkedin/dustjs/pull/243) compiler variable name changed to dustCompiler (@jairodemorais)
- [#241](https://github.com/linkedin/dustjs/pull/241) using dust.isArray in place of Array.isArray (@jairodemorais)

### v1.2.1 (2013/02/19 17:55 +00:00)
- [#236](https://github.com/linkedin/dustjs/pull/236) eol added to buffer again. (@jairodemorais)

### v1.2.0 (2013/02/08 17:56 +00:00)
- [#223](https://github.com/linkedin/dustjs/pull/223) Fix for Issue #222. Code change + new test added to verify proper behavior (@rragan)
- [#216](https://github.com/linkedin/dustjs/pull/216) add semicolons to dust compiler GH=215 (@jairodemorais)
- [#188](https://github.com/linkedin/dustjs/pull/188) The whitespace grammar rule for partial was a little inconsistent with other tags. issue GH=187 fixed. (@jairodemorais)
- [#166](https://github.com/linkedin/dustjs/pull/166) Add template strip of white space to dust.compile (optional defaults to not strip) (@smfoote)
- [#183](https://github.com/linkedin/dustjs/pull/183) cover, uglify and jasmine move to dev dependencies. GH-183 (@jairodemorais)
- [#168](https://github.com/linkedin/dustjs/pull/168) Minor README update (@sethmcl)
- [#165](https://github.com/linkedin/dustjs/pull/165) improve description in unit tests (@vybs)
- [#159](https://github.com/linkedin/dustjs/pull/159) fix the description on the core tests for $idx and $len for scalar (@vybs)
- [#158](https://github.com/linkedin/dustjs/pull/158) fix the bad merge (@vybs)

### v1.1.1 (2012/09/30 22:43 +00:00)
- [#157](https://github.com/linkedin/dustjs/pull/157) Add unit tests for the pull/154 (@vybs)
- [#154](https://github.com/linkedin/dustjs/pull/154) partials with parameters context was missing blocks (@jimmyhchan)
- [#156](https://github.com/linkedin/dustjs/pull/156) Cleanup the helpers from the dust repo, fix the make test (@vybs)

### v1.1.0 (2012/09/20 22:06 +00:00)
- [#152](https://github.com/linkedin/dustjs/pull/152) Really undo 2760048: removing scalar block support (@jimmyhchan)
- [#151](https://github.com/linkedin/dustjs/pull/151) add v1.1 files to the dist (@vybs)
- [#146](https://github.com/linkedin/dustjs/pull/146) Remove the old grammartests file, since it renamed to coreTests now and guard against missing context head in section (@vybs)
- [#145](https://github.com/linkedin/dustjs/pull/145) rename grammar tests to core tests, since it testing dust.js core functionality, also has GH-133, fix the missing helper case (@vybs)
- [#144](https://github.com/linkedin/dustjs/pull/144) minor: reorganized the section code and documented some more as to how t... (@vybs)
- [#143](https://github.com/linkedin/dustjs/pull/143) reverse the GH-134 since it is backward incompatible (@vybs)
- [#142](https://github.com/linkedin/dustjs/pull/142) add another intersting test case with . and blocks (@vybs)
- [#141](https://github.com/linkedin/dustjs/pull/141) Fixes for GH-134 (@vybs)
- [#140](https://github.com/linkedin/dustjs/pull/140) GH-134 , remove support for scalar in the block # (@vybs)
- [#139](https://github.com/linkedin/dustjs/pull/139) GH-85, GH-127 improve test coverage (@vybs)
- [#127](https://github.com/linkedin/dustjs/pull/127) Fixed :else in section when iterating over empty array. (@zzen)
- [#132](https://github.com/linkedin/dustjs/pull/132) Partial with parameters was not getting the correct context (@jimmyhchan)
- [#108](https://github.com/linkedin/dustjs/pull/108) issue 106, accessing array inside a loop using the current context (@jairodemorais)
- [#128](https://github.com/linkedin/dustjs/pull/128) Updated README for consistency and readability (@zzen)
- [#126](https://github.com/linkedin/dustjs/pull/126) Removed left-over .DS_Store files (@zzen)
- [#99](https://github.com/linkedin/dustjs/pull/99) new math helper method (@sclatter)
- [#113](https://github.com/linkedin/dustjs/pull/113) Make $idx/$len work for all array  objects and not leave old values in contexts (@rragan)
- [#105](https://github.com/linkedin/dustjs/pull/105) merge PR https://github.com/linkedin/dustjs/pull/93 (@jairodemorais)
- [#95](https://github.com/linkedin/dustjs/pull/95) helpers removed from Dust core. New npm package created for helpers. (@jairodemorais)

### v1.0.0 (2012/07/04 19:08 +00:00)
- [#78](https://github.com/linkedin/dustjs/pull/78) Use the tap method in the select helper (@jairodemorais)
- [#65](https://github.com/linkedin/dustjs/pull/65) literal params relaxed to allow eol (@jairodemorais)
- [#70](https://github.com/linkedin/dustjs/pull/70) fix issue https://github.com/linkedin/dustjs/issues/68 (@jairodemorais)
- [#73](https://github.com/linkedin/dustjs/pull/73) dust resolve reference helper created and refactor if to use it (@jairodemorais)
- [#71](https://github.com/linkedin/dustjs/pull/71) Test for pipe function added. (@jairodemorais, @kilianc)
- [#56](https://github.com/linkedin/dustjs/pull/56) Fix for Issue #50: helper for debugging the context + console log wrapper (@jimmyhchan)
- [#60](https://github.com/linkedin/dustjs/pull/60) dust moved to 0.6.0 version (@jairodemorais)
- [#59](https://github.com/linkedin/dustjs/pull/59) ws relaxed to allow eol (@jairodemorais)
- [#54](https://github.com/linkedin/dustjs/pull/54) preventing dust to crash on non existant if-condition (@seriousManual)
- [#52](https://github.com/linkedin/dustjs/pull/52) Added unit test code coverage report with node-coverage (@jleppert)
- [#44](https://github.com/linkedin/dustjs/pull/44) Select helper and unit tests, fixes #16 (@jleppert)
- [#49](https://github.com/linkedin/dustjs/pull/49) dust tool included. (@jairodemorais)
- [#40](https://github.com/linkedin/dustjs/pull/40) Rebuilding parser and merge to fix failed CI (@jleppert)
- [#37](https://github.com/linkedin/dustjs/pull/37) Fixes #7, "Support numbers in the aliases" (@jleppert)
- [#39](https://github.com/linkedin/dustjs/pull/39) Fixes #28, better error tracking implemented. (@jleppert)
- [#31](https://github.com/linkedin/dustjs/pull/31) process.nextTick instead of setTimeout (@seriousManual)
- [#34](https://github.com/linkedin/dustjs/pull/34) Escape a single quote apostrophe in escapeHtml (@jleppert)
- [#36](https://github.com/linkedin/dustjs/pull/36) Rhino compatible (@jairodemorais)
- [#13](https://github.com/linkedin/dustjs/pull/13) Issue #8 Support cleaner way to pass arguments to partials (@jimmyhchan)
- [#25](https://github.com/linkedin/dustjs/pull/25) pegjs 0.7 compatibility and parser variables removed from section function on dustjs file (@jairodemorais)
- [#9](https://github.com/linkedin/dustjs/pull/9) Update to 0.4.0 in dist so that docs are correct (@kmiyashiro)
- [#5](https://github.com/linkedin/dustjs/pull/5) Quote 'if' helper, fixes #4 (@kmiyashiro)
- [#3](https://github.com/linkedin/dustjs/pull/3) Gaurd against browsers (@Raynos)
- [#25](https://github.com/linkedin/dustjs/pull/25) process.binding('evals') is now require('vm') (@stonecobra)