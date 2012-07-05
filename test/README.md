Dust original Unit tests
------------------------
This test are developed to be run with nodejs,
so if you want to run them you should execute this command in the terminal: "node test/server.js"

Dust Unit tests using jasmine
-----------------------------

How to run the unit-tests with jasmine?

In the current distribution of dust, we have unit tests in Jasmine for both the client and the nodejs version.
If you want to run the client version just open the html page called specRunner.html located in
 
     test/jasmine-test/client/specRunner.html

Pre-requisites for tests on node server version: 
----------------------------------
* install nodejs 0.6 or greater 
* install npm
* install Jasmine test framework : npm install -g jasmine-node

In order to run the node.js version of dust, run this command in the terminal

     node test/jasmine-test/server/specRunner.js


With make
-------------------
  * original unit tests: 
       make test

  * jasmine unit test
       make jasmine

Note: the above commands has to be executed in the project root folder.

Code coverage report
-----------------------------

We are using a tool called node-cover, it can be installed by npm with the following command:

     npm install cover -g

Once you have installed cover, you can use it to generate the code coverage results

Execute Cover
-------------- 

      cover run test/jasmine-test/server/specRunner.js // executes all the test and creates a folder with results.
   
      cover report // shows you a table with % code covered, missed lines, #lines, %blocks, missed blocks and # blocks.

      cover report html //creates a folder the location where you executed the command and the report is in html.

The results are very complete, it creates one html file per js file used by the test. 
The lines that are not covered are shown on red.


