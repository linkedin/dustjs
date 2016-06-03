var window = this;

var isRhino = true;

print('Running unit tests with ' + environment['java.class.path']);

var requiredFiles = [
    'node_modules/jasmine-core/lib/jasmine-core/jasmine.js',
    'test/lib/rhino-bootstrap.js',
    'node_modules/ayepromise/ayepromise.js',
    'node_modules/highland/dist/highland.js',
    'tmp/dust-full.min.js',
    'test/helpers/template.helper.js',
    'test/templates/all.js',
    'test/templates.spec.js'
  ];

//load all of the dependencies and unit tests
for(var i = 0; i < requiredFiles.length; i++){
  load(requiredFiles[i]);
}

//execute unit tests
env.execute();
