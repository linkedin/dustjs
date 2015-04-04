var window = this;

print('Running unit tests with ' + environment['java.class.path']);

var requiredFiles = [
    'node_modules/grunt-contrib-jasmine/vendor/jasmine-2.0.1/jasmine.js',
    'test/rhino/bootstrap.js',
    'node_modules/ayepromise/ayepromise.js',
    'test/lib/highland.js',
    'tmp/dust-full.min.js',
    'test/jasmine-test/spec/testHelpers.js',
    'test/jasmine-test/spec/coreTests.js',
    'test/jasmine-test/spec/renderTestSpec.js'
  ];

//load all of the dependencies and unit tests
for(var i = 0; i < requiredFiles.length; i++){
  load(requiredFiles[i]);
}

//execute unit tests
env.execute();
