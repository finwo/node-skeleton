var loaded = {},
    Q      = require('q');

// Register global service function
global.service = function ( name ) {

  // Load service if needed
  if ( !loaded[name] ) {
    loaded[name] = config.service[name] || false;

    // Callbacks
    if ( 'function' == typeof loaded[name] ) loaded[name] = loaded[name]();

    // Generators
    if ( 'function' == typeof loaded[name].next ) {
      var store = null, current = false;
      while( current = loaded[name].next ) {
        store = current;
      }
      loaded[name] = store;
    }

    // Promises
    if ( 'function' == typeof loaded[name].then ) {
      loaded[name].then(function(mod) {
        loaded[name] = mod;
      });
    }
  }
  return loaded[name];
};

global.service.register = function( name, module ) {
  return Q.fcall(function() {
    return loaded[name] = loaded[name] || module;
  });
};
