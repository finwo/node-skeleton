var loaded = {},
    Q      = require('q');

// Register global service function
global.service = function ( name ) {
  return Q.fcall(Q.async(function*() {
    if ( !loaded[name] ) {
      loaded[name] = yield config.service[name]();
    }
    return loaded[name];
  }));
};

global.service.register = function( name, module ) {
  return Q.fcall(function() {
    return loaded[name] = loaded[name] || module;
  });
};
