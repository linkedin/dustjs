Dust core unit-tests
------------------------
In the current distribution of dust, we have unit tests in jasmine for both the client and the nodejs version.
If you want to run the node.js version, use the following command:

     grunt test

Dust unit-tests using jasmine
-----------------------------
If you want to run the client version use the following command to build the spec runner:
 
     grunt testClient

then navigate to http://localhost:3000/_SpecRunner.html

Running tests on node server version 
------------------------------------
* install nodejs 0.6 or greater 
* install npm
* install all dependencies by running in the package directory:

         npm install

* and then run this command in the terminal

         grunt test



Running code coverage report
----------------------------

* Code coverage is generated whenever you run the grunt test task. Run the tests

       grunt test


then open tmp/coverage/index.html in your browser of choice

on `darwin` use `open tmp/coverage/index.html`
on `Linux and the like` use `xdg-open tmp/coverage/index.html`
on `win32` use `start tmp/coverage/index.html`


