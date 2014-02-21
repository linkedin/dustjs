## Change Log

### v2.2.6 (2014/02/13 00:18 +00:00)
- [#420](https://github.com/linkedin/dustjs/pull/420) Back compatible compiler (@kate2753)


### v2.3.3 (2014/01/31 21:29 +00:00)
- [#416](https://github.com/linkedin/dustjs/pull/416) Lower most errors to warnings.  (@prashn64)


### v2.3.2 (2014/01/28 01:12 +00:00)
- [#414](https://github.com/linkedin/dustjs/pull/414) Issue #413 point dustc to the correct version of server dust  (@jimmyhchan)


### v2.3.1 (2014/01/19 22:23 +00:00)
- [#408](https://github.com/linkedin/dustjs/pull/408) Issue #407, compileFn does not require a name. Add unit test as well (@jimmyhchan)


### v2.3.0 (2014/01/17 00:26 +00:00)
- [#399](https://github.com/linkedin/dustjs/pull/399) Don't swallow all errors by default.  Deprecate isDebug and just use debugLevel. Add a silenceErrors flag to swallow all errors. (@prashn64)

- [#395](https://github.com/linkedin/dustjs/pull/395) fail hard when a name is not explicitly defined in dust.compile (@prashn64)

- [#403](https://github.com/linkedin/dustjs/pull/403) bump commit does not support tasks (@jimmyhchan)

- [#404](https://github.com/linkedin/dustjs/pull/404) revert package.json back to 2.2.3 (@prashn64)

- [#392](https://github.com/linkedin/dustjs/pull/392) Rhino unit tests (@kate2753)

- [#405](https://github.com/linkedin/dustjs/pull/405) Fix Grunt release and don't push upstream by default (safer) (@jimmyhchan)


### v2.1.1 (2014/01/16 01:09 +00:00)
- [#371](https://github.com/linkedin/dustjs/pull/371) Fix our release process + add bower.json + jshint + cleanup master (@jimmyhchan)

- [#334](https://github.com/linkedin/dustjs/pull/334) Issue #332 provide a raw input syntax similar to comments {!...!} where ... (@jimmyhchan)

- [#382](https://github.com/linkedin/dustjs/pull/382) remove the globals and isolate parser and compiler (@jimmyhchan)


### v2.2.3 (2013/12/06 02:02 +00:00)
- [#372](https://github.com/linkedin/dustjs/pull/372) Regenerate dist files for v2.2.2 (@kate2753)

- [#374](https://github.com/linkedin/dustjs/pull/374) Properly generate .min files for 2.2.3 (@kate2753)


### v2.2.2 (2013/11/28 00:10 +00:00)
- [#362](https://github.com/linkedin/dustjs/pull/362) remove node_modules directory (@wizardzloy)

- [#363](https://github.com/linkedin/dustjs/pull/363) Issue #340. Remove old optimization to avoid looking at arrays in get. (@rragan)

- [#368](https://github.com/linkedin/dustjs/pull/368) Fix context.templateName for directly loaded templates being used as partials (@prashn64)


### v2.2.0 (2013/11/08 18:42 +00:00)
- [#350](https://github.com/linkedin/dustjs/pull/350) Support dynamic template name in partial  (@johnsonlei)

- [#360](https://github.com/linkedin/dustjs/pull/360) Use get for all Dust references (@smfoote)


### v2.1.0 (2013/10/25 08:44 +00:00)
- [#338](https://github.com/linkedin/dustjs/pull/338) update 2.0.3 to most updated dustjs (@prashn64)

- [#344](https://github.com/linkedin/dustjs/pull/344) Revert "Merge pull request #279 from prashn64/master" (@prashn64)

- [#279](https://github.com/linkedin/dustjs/pull/279) Client Side Debugging (@prashn64)

- [#355](https://github.com/linkedin/dustjs/pull/355) add a unit test for inline params with dashes (@prashn64)

- [#347](https://github.com/linkedin/dustjs/pull/347) Dust error logging (@prashn64)


### v2.0.3 (2013/09/06 23:23 +00:00)
- [#320](https://github.com/linkedin/dustjs/pull/320) Update parser.js to sync with latest dust.pegjs (@smfoote)

- [#323](https://github.com/linkedin/dustjs/pull/323) Fix Issue #322. block name in template includes previous text by mistake (@rragan)

- [#328](https://github.com/linkedin/dustjs/pull/328) Put templateName on the context instance instead of the context's globals. (@prashn64)

- [#335](https://github.com/linkedin/dustjs/pull/335) make context.templateName change into version 2.0.3 (@prashn64)


### v2.0.2 (2013/08/01 20:57 +00:00)
- [#318](https://github.com/linkedin/dustjs/pull/318) Fix issue #317. Falsey value at end of path (@rragan)

- [#319](https://github.com/linkedin/dustjs/pull/319) Clarify comments on path search (@rragan)


### v2.0.1 (2013/07/24 17:34 +00:00)
- [#306](https://github.com/linkedin/dustjs/pull/306) add support for GH-292, support the template name in nested partials (@vybs)

- [#312](https://github.com/linkedin/dustjs/pull/312) Remove node_modules/jasmine_node (@smfoote)

- [#309](https://github.com/linkedin/dustjs/pull/309) Add lines and columns to dust.pegjs (@smfoote)


### v2.0.0 (2013/07/17 02:18 +00:00)
- [#295](https://github.com/linkedin/dustjs/pull/295) upgrading jasmine-node to the latest version (1.9) (@jairodemorais)

- [#289](https://github.com/linkedin/dustjs/pull/289) Cache VM context across `dust.loadSource` calls. (@totherik)

- [#304](https://github.com/linkedin/dustjs/pull/304) GH-292 support template name in nested partials, need a stack to store the current name (@vybs)

- [#271](https://github.com/linkedin/dustjs/pull/271) adding support for . path resolution in context get (@carchrae)

- [#305](https://github.com/linkedin/dustjs/pull/305) Remove option to control pathScope and remove tests for old getPath (@rragan)


### v1.2.6 (2013/06/06 15:54 +00:00)
- [#278](https://github.com/linkedin/dustjs/pull/278) Remove strip from dust.compile, since it wasn't really very good anyway (@smfoote)


### v1.2.5 (2013/06/02 21:25 +00:00)
- [#253](https://github.com/linkedin/dustjs/pull/253) 2-3000% performance enhancement in IE7 (@jlkonsultab)

- [#274](https://github.com/linkedin/dustjs/pull/274) GH-266 store rendered template in global (@vybs)

- [#263](https://github.com/linkedin/dustjs/pull/263) Add forward slash and unit tests for j filter (@prashn64)


### v1.2.3 (2013/04/11 17:47 +00:00)
- [#249](https://github.com/linkedin/dustjs/pull/249) Remove debugger in dust-full-1.2.1.js (@sethkinast)


### v1.2.2 (2013/03/19 20:07 +00:00)
- [#241](https://github.com/linkedin/dustjs/pull/241) using dust.isArray in place of Array.isArray (@jairodemorais)

- [#243](https://github.com/linkedin/dustjs/pull/243) compiler variable name changed to dustCompiler (@jairodemorais)

- [#245](https://github.com/linkedin/dustjs/pull/245) Gh-208 - solve the incorrect error line reported in peg (@jairodemorais)


### v1.2.1 (2013/02/19 17:55 +00:00)
- [#236](https://github.com/linkedin/dustjs/pull/236) eol added to buffer again. (@jairodemorais)


### v1.2.0 (2013/02/08 17:56 +00:00)
- [#168](https://github.com/linkedin/dustjs/pull/168) Minor README update (@sethmcl)

- [#177](https://github.com/linkedin/dustjs/pull/177) group core tests (@jairodemorais)

- [#183](https://github.com/linkedin/dustjs/pull/183) cover, uglify and jasmine move to dev dependencies. GH-183 (@jairodemorais)

- [#188](https://github.com/linkedin/dustjs/pull/188) The whitespace grammar rule for partial was a little inconsistent with other tags. issue GH=187 fixed. (@jairodemorais)

- [#216](https://github.com/linkedin/dustjs/pull/216) add semicolons to dust compiler GH=215 (@jairodemorais)

- [#223](https://github.com/linkedin/dustjs/pull/223) Fix for Issue #222. Code change + new test added to verify proper behavior (@rragan)

- [#166](https://github.com/linkedin/dustjs/pull/166) Add template trim of white space  to dust.compile (@smfoote)

- [#159](https://github.com/linkedin/dustjs/pull/159) fix the description on the core tests for $idx and $len for scalar (@vybs)

- [#158](https://github.com/linkedin/dustjs/pull/158) fix the bad merge (@vybs)

- [#165](https://github.com/linkedin/dustjs/pull/165) improve description in unit tests (@vybs)


### v1.1.1 (2012/09/30 22:43 +00:00)
- [#152](https://github.com/linkedin/dustjs/pull/152) Really undo 2760048: removing scalar block support (@jimmyhchan)

- [#154](https://github.com/linkedin/dustjs/pull/154) partials with parameters context was missing blocks (@jimmyhchan)

- [#157](https://github.com/linkedin/dustjs/pull/157) Add unit tests for the pull/154 (@vybs)

- [#156](https://github.com/linkedin/dustjs/pull/156)  Cleanup the helpers from the dust repo, fix the make test (@vybs)


### v1.1.0 (2012/09/20 22:06 +00:00)
- [#95](https://github.com/linkedin/dustjs/pull/95) helpers removed from Dust core. New npm package created for helpers. (@jairodemorais)

- [#92](https://github.com/linkedin/dustjs/pull/92) proposing the size helper (@zaphod1984)

- [#89](https://github.com/linkedin/dustjs/pull/89) Multiple event-listeners on dustjs.Stream (@oleics)

- [#105](https://github.com/linkedin/dustjs/pull/105) merge PR https://github.com/linkedin/dustjs/pull/93 (@jairodemorais)

- [#113](https://github.com/linkedin/dustjs/pull/113) Make $idx/$len work for all array  objects and not leave old values in contexts (@rragan)

- [#99](https://github.com/linkedin/dustjs/pull/99) new math helper method (@sclatter)

- [#126](https://github.com/linkedin/dustjs/pull/126) Removed left-over .DS_Store files (@zzen)

- [#128](https://github.com/linkedin/dustjs/pull/128) Updated README for consistency and readability (@zzen)

- [#108](https://github.com/linkedin/dustjs/pull/108) issue 106, accessing array inside a loop using the current context (@jairodemorais)

- [#140](https://github.com/linkedin/dustjs/pull/140) GH-134 , remove support for scalar in the block # (@vybs)

- [#144](https://github.com/linkedin/dustjs/pull/144) minor: reorganized the section code and documented some more as to how t... (@vybs)

- [#141](https://github.com/linkedin/dustjs/pull/141) Fixes for GH-134 (@vybs)

- [#145](https://github.com/linkedin/dustjs/pull/145)  rename grammar tests to core tests, GH-133, fix the missing helper case (@vybs)

- [#146](https://github.com/linkedin/dustjs/pull/146) Remove the old grammartests and guard against missing context head in section (@vybs)

- [#142](https://github.com/linkedin/dustjs/pull/142)  add another intersting test case with . and blocks (@vybs)

- [#143](https://github.com/linkedin/dustjs/pull/143)  reverse the GH-134 since it is backward incompatible (@vybs)

- [#139](https://github.com/linkedin/dustjs/pull/139) GH-85, GH-127 improve test coverage (@vybs)

- [#151](https://github.com/linkedin/dustjs/pull/151) add v1.1 files to the dist (@vybs)

- [#127](https://github.com/linkedin/dustjs/pull/127) Fixed :else in section when iterating over empty array. (@zzen)

- [#132](https://github.com/linkedin/dustjs/pull/132) Partial with parameters was not getting the correct context (@jimmyhchan)


### v1.0.0 (2012/07/04 19:08 +00:00)
- [#3](https://github.com/linkedin/dustjs/pull/3) Gaurd against browsers (@Raynos)

- [#5](https://github.com/linkedin/dustjs/pull/5) Quote 'if' helper, fixes #4 (@kmiyashiro)

- [#9](https://github.com/linkedin/dustjs/pull/9) Update to 0.4.0 in dist so that docs are correct (@kmiyashiro)

- [#37](https://github.com/linkedin/dustjs/pull/37) Fixes #7, "Support numbers in the aliases" (@iamleppert)

- [#52](https://github.com/linkedin/dustjs/pull/52) Added unit test code coverage report with node-coverage (@iamleppert)

- [#49](https://github.com/linkedin/dustjs/pull/49) dust tool included. (@jairodemorais)

- [#44](https://github.com/linkedin/dustjs/pull/44) Select helper and unit tests, fixes #16 (@iamleppert)

- [#39](https://github.com/linkedin/dustjs/pull/39) Fixes #28 (@iamleppert)

- [#40](https://github.com/linkedin/dustjs/pull/40) Rebuild parser (@iamleppert)

- [#36](https://github.com/linkedin/dustjs/pull/36) Rhino compatible (@jairodemorais)

- [#34](https://github.com/linkedin/dustjs/pull/34) Escape a single quote apostrophe in escapeHtml (@iamleppert)

- [#31](https://github.com/linkedin/dustjs/pull/31) process.nextTick instead of setTimeout (@zaphod1984)

- [#25](https://github.com/linkedin/dustjs/pull/25) pegjs 0.7 compatibility and parser variables removed from section function on dustjs file (@jairodemorais)

- [#54](https://github.com/linkedin/dustjs/pull/54) preventing dust to crash on non existant if-condition (@zaphod1984)

- [#59](https://github.com/linkedin/dustjs/pull/59) ws relaxed to allow eol (@jairodemorais)

- [#60](https://github.com/linkedin/dustjs/pull/60) dust moved to 0.6.0 version (@jairodemorais)

- [#71](https://github.com/linkedin/dustjs/pull/71) Test for pipe function added. (@jairodemorais)

- [#73](https://github.com/linkedin/dustjs/pull/73) dust resolve reference helper created and refactor if to use it (@jairodemorais)

- [#70](https://github.com/linkedin/dustjs/pull/70) fix issue https://github.com/linkedin/dustjs/issues/68 (@jairodemorais)

- [#65](https://github.com/linkedin/dustjs/pull/65) literal params relaxed to allow eol (@jairodemorais)

- [#78](https://github.com/linkedin/dustjs/pull/78) Use the tap method in the select helper (@jairodemorais)

- [#53](https://github.com/linkedin/dustjs/pull/53) added Stream.pipe (@kilianc)

- [#56](https://github.com/linkedin/dustjs/pull/56) Fix for Issue #50: helper for debugging the context + console log wrapper (@jimmyhchan)

- [#13](https://github.com/linkedin/dustjs/pull/13) Issue #8 Support cleaner way to pass arguments to partials (@jimmyhchan)
