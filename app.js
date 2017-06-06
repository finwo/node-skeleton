var http   = require('http'),
    Router = require('node-simple-router'),
    Q      = require('q');

// Helpers
global.set_deep = require('./src/helpers/set_deep');
global.readdir  = require('./src/helpers/readdir');

// Initialize config
global.approot = __dirname;
global.config  = require('./config');

// Initialize service registry
require('./src/service');

// Setup router
var router = new Router( config.http );
service.register( 'router', router );

// Setup controllers
require('./src/controllers');

// Start the server
var server = http.createServer(router);
server.listen(config.http.port);
console.log('Server running on port', config.http.port);
