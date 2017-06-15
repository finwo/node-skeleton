var co     = require('co'),
    colors = require('colors'),
    extend = require('extend'),
    http   = require('http'),
    sockjs = require('sockjs');

// Initialize services & config
co(function*() {
  require('./src/helper');
  require('./src/service');
  global.approot = __dirname;
  global.config  = yield require('./config');
  extend( http.globalAgent, config.http.globalAgent || {});
})

  // Bootstrap code
  .then(co.wrap(function*() {

  }))

  // Initialize server
  .then(co.wrap(function*() {

    // Middleware & routes
    var router = yield service('router');
    router.register(yield require('./src/middleware'));
    router.register(yield require('./src/controller'));

    // HTTP daemon
    var server = http.createServer(router);
    server.listen(config.http.port);
    console.log('Server running on port', config.http.port);

    // Websockets
    var ws = sockjs.createServer(config.http.ws);
    ws.installHandlers(server);
    ws.on('connection', function(conn) {
      conn.on('data', function(message) {
        // Message structure: "uid json"
      });
    });
    //echo.on('connection', function ( conn ) {
    //  conn.on('data', function ( message ) {
    //    console.log(message);
    //    conn.write(message);
    //  });
    //  conn.on('close', function () {});
    //});
    //echo.installHandlers(server, {prefix: '/socket'});

  }));
