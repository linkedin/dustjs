(function (root, factory) {
  if (typeof exports === 'object') {
    factory(require('../../../lib/dust'), require('ayepromise'));
  } else {
    factory(root.dust, ayepromise);
  }
}(this, function(dust, ayepromise) {
  dust.helpers = {};
  dust.helpers.error = function(chunk, context, bodies, params) {
    throw params.errorMessage;
  };
  dust.helpers.promise = function(chunk, context, bodies, params) {
    var defer = ayepromise.defer();
    if (params.reject) {
      defer.reject(params.reject);
    } else {
      defer.resolve(params.resolve);
    }
    return defer.promise;
  };
}));
