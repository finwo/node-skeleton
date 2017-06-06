var http   = require('http'),
    Router = require('node-simple-router'),
    Q      = require('q');

// Helpers
global.set_deep = require('./src/helper/set_deep');

// Initialize config
global.approot = __dirname;
global.config  = require('./config');

// Initialize service registry
require('./src/service');

// Setup router
var router = new Router( config.http );
service.register( 'router', router );

// Setup controllers
require('./src/controller');

// Start the server
var server = http.createServer(router);
server.listen(config.http.port);
console.log('Server running on port', config.http.port);

//// Our base application
//app.run(Q.async(function*( request ){
//  console.log(request);
//}));
//
//// Start our application
//mach.serve(app, config.http.port);


//require('q')
//  .async(function *() {
//    console.log('dinges');
//  });
////  .then(function* ())
////
////
////Q.fcall(function* () {
////
////  // Initialize globals
////  global.approot = __dirname;
////  global.config  = require('./config');
////
////  console.log(arguments);
////  console.log(config);
//////
//////// Initialize service loader
//////  require('./src/service');
//////
//////  var x = service('odm');
//////
//////  while(!x.done) {
//////    console.log(x.next());
//////  }
////
//////var http = require('http');
//////
//////var server = http.createServer(function(req, res) {
//////  res.end('dinges');
//////});
//////
//////server.listen(config.http.port);
////
////}).then(function() {
////  console.log('exit:', arguments);
////});
