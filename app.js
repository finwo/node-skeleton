var http   = require('http'),
    Router = require('node-simple-router'),
    Q      = require('q');

// Helpers
require('./src/helpers');

// Initialize config
global.approot = __dirname;
global.config  = require('./config');

// Initialize service registry
require('./src/service');

// Initialize middleware
require('./src/middleware');

// Setup router
var router = new Router( config.http );
service.register( 'router', router );

// Setup controllers
require('./src/controllers');

// Start the server
var server = http.createServer(Q.async(function*(req, res) {
  var hooks = yield service('middleware'),
      keys  = Object.keys(hooks),
      key;

  while(key = keys.shift()) {
    yield hooks[key](req, res);
  }

  return router(req, res);
}));
server.listen(config.http.port);
console.log('Server running on port', config.http.port);
