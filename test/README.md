To run the tests
----------------

With MakeFile:
  * unit Test   : "make test"
  * jasmine test: "make jasmine"

note: the commands mentioned above has to be executed in the project root folder.

Dust original Unit tests
------------------------
This test are developed to be run with nodejs, so if you want to run them you should execute this command in the terminal: "node test/server.js"

Unit tests using Jasmine
------------------------

How to run the unit-tests?

In this distributions of dust, we have unit tests in Jasmine for both the client and the nodejs version.
If you want to run the client version just open the html page called specRunner.html located on "test/jasmine-test/client/specRunner.html".

In order to run the server distribution of dust, run this command in the terminal: "node test/jasmine-test/server/specRunner.js" 


pre-requisites for tests on node server version: 
----------------------------------
* install nodejs 0.6 or greater 
* install npm
* install Jasmine test framework (npm install -g jasmine-node)


