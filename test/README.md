Dust core unit-tests
------------------------
In the current distribution of dust, we have unit tests in jasmine for both the client and the nodejs version.
If you want to run the node.js version, use the following command:

     node test/server.js

Dust unit-tests using jasmine
-----------------------------
If you want to run the client version just open the html page called specRunner.html located in:
 
     test/jasmine-test/client/specRunner.html

**Note:** Unlike the node.js version, the browser version needs pre-compiled distribution files to run. If you made local changes to your dust code, use the `make` command to run tests _(see below)_.

Running tests on node server version 
------------------------------------
* install nodejs 0.6 or greater 
* install npm
* install testing dependencies by running in the package directory:

         npm install

* and then run this command in the terminal

         node test/jasmine-test/server/specRunner.js


Running tests with make
-----------------------
* core unit tests:

        make test

* jasmine unit test:

        make jasmine

**Note:** the above commands has to be run in the project root folder.


Running code coverage report
----------------------------

* follow the node server test instructions above to install dependencies
* install our coverage tool called node-cover using npm

        npm install cover -g

* you can now use it to generate the code coverage results

  * run all the test and create a folder with results

            cover run test/jasmine-test/server/specRunner.js

  * show a table with % code covered, missed lines, #lines, %blocks, missed blocks and #blocks

            cover report

  * create a folder in the location where you run the command. Inside it is the coverage report in html

            cover report html

  * Cover creates one html file per js file used in the unit-test
  
  * The lines that are not covered by the unit-tests are shown on red