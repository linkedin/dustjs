/*jshint unused:false*/
var path = require('path'),
    fs = require('fs'),
    exec = require('child_process').exec;

var ROOT_DIR = path.resolve(__dirname, '../../'),
    BIN_DIR = path.join(ROOT_DIR, 'bin'),
    TMP_DIR = require('tmp').dirSync().name,
    FIXTURE_DIR = path.join(__dirname, 'fixtures');

var packageJson = require(path.join(ROOT_DIR, 'package.json'));

describe('dustc', function() {

describe('template piped from stdin', function() {
  it('compiles anonymously if --name is not set', function(done) {
    dustc('< a.dust', function(err, stdout, stderr) {
      expect(stdout).toMatch(/function\(dust\)/g);
      done();
    });
  });
  it('is compiled if a name is set', function(done) {
    dustc('< a.dust --name=hello', function(err, stdout, stderr) {
        expect(stdout).toHaveTemplate('hello');
        done();
    });
  });
});

describe('template passed as a filename', function() {
  it('gets compiled with its filename as the template name', function(done) {
    dustc('a.dust', function(err, stdout, stderr) {
      expect(stdout).toHaveTemplate('a');
      done();
    });
  });
  it('can be a glob', function(done) {
    dustc('*.dust', function(err, stdout, stderr) {
      expect(stdout).toHaveTemplate('a');
      expect(stdout).toHaveTemplate('b');
      done();
    });
  });
  it('can be found in subdirectories', function(done) {
    dustc('one/*.dust two/*.dust two/three/*.dust', function(err, stdout, stderr) {
      expect(stdout).toHaveTemplate('one/1a');
      expect(stdout).toHaveTemplate('two/2');
      expect(stdout).toHaveTemplate('two/three/3');
      done();
    });
  });
});

describe('--name', function() {
  it('overrides the automatic template name', function(done) {
    dustc('a.dust --name=hello', function(err, stdout, stderr) {
      expect(stdout).toHaveTemplate('hello');
      done();
    });
  });
});

describe('--whitespace', function() {
  it('sets dust.config.whitespace to true', function(done) {
    dustc('a.dust --whitespace', function(err, stdout, stderr) {
      expect(stdout).toMatch(/((\\r)?\\n){4}/);
      done();
    });
  });
});

describe('--pwd', function() {
  it('sets the prefix for template names', function(done) {
    dustc('one/*.dust --pwd=one', function(err, stdout, stderr) {
      expect(stdout).toHaveTemplate('1a');
      expect(stdout).toHaveTemplate('1b');
      done();
    });
  });
});

describe('--output', function() {
  var OUTPUT = path.join(TMP_DIR, 'output.js');

  it('redirects output to a file', function(done) {
    dustc('a.dust b.dust two/2.dust --output=' + OUTPUT, function() {
      expect(OUTPUT).toBeFileWithTemplate('a');
      expect(OUTPUT).toBeFileWithTemplate('b');
      expect(OUTPUT).toBeFileWithTemplate('two/2');
      done();
    });
  });

  afterEach(function() {
    fs.unlinkSync(OUTPUT);
  });
});

describe('--split', function() {
  it('splits output to files named like the templates', function(done) {
    dustc('a.dust b.dust two/2.dust --split', function() {
      expect(fixture('a.js')).toBeFileWithTemplate('a');
      expect(fixture('b.js')).toBeFileWithTemplate('b');
      expect(fixture('two/2.js')).toBeFileWithTemplate('two/2');
      done();
    });
  });

  afterEach(function() {
    fs.unlinkSync(fixture('a.js'));
    fs.unlinkSync(fixture('b.js'));
    fs.unlinkSync(fixture('two/2.js'));
  });
});

describe('--amd', function() {
  it('compiles a single template as an AMD module', function(done) {
    dustc('a.dust --amd', function(err, stdout, stderr) {
      expect(stdout).toHaveAMDTemplate('a');
      done();
    });
  });
  it('compiles several templates into an AMD module package', function(done) {
    dustc('a.dust b.dust two/2.dust --amd', function(err, stdout, stderr) {
      expect(stdout).toHaveAMDTemplate('a');
      expect(stdout).toHaveAMDTemplate('b');
      expect(stdout).toHaveAMDTemplate('two/2');
      done();
    });
  });
});

describe('--cjs', function() {
  it('compiles a single template as a CommonJS module', function(done) {
    dustc('a.dust --cjs', function(err, stdout, stderr) {
      expect(stdout).toHaveCJSTemplate('a');
      done();
    });
  });
  it('compiles several templates and splits', function(done) {
    dustc('a.dust b.dust two/2.dust --cjs', function(err, stdout, stderr) {
      expect(fixture('a.js')).toBeFileWithTemplate('a');
      expect(fixture('b.js')).toBeFileWithTemplate('b');
      expect(fixture('two/2.js')).toBeFileWithTemplate('two/2');
      fs.unlinkSync(fixture('a.js'));
      fs.unlinkSync(fixture('b.js'));
      fs.unlinkSync(fixture('two/2.js'));
      done();
    });
  });
});

describe('--version', function() {
  it('displays the version number', function(done) {
    dustc('--version', function(err, stdout, stderr) {
      expect(stderr).toMatch('dustc v' + packageJson.version);
      done();
    });
  });
});

});

/*** Helper Functions ***/

function dustc(args, cb) {
  var loc = path.join(BIN_DIR, 'dustc');
  exec('node ' + loc + ' ' + args, { cwd: FIXTURE_DIR }, cb);
}

function fixture(file) {
  return path.resolve(FIXTURE_DIR, file);
}
