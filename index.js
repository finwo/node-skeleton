var co     = require('co'),
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
    var echo = sockjs.createServer({
      log       : config.http.log,
      prefix    : '/socket',
      sockjs_url: 'http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js'
    });
    echo.on('connection', function ( conn ) {
      conn.on('data', function ( message ) {
        conn.write(message);
      });
      conn.on('close', function () {});
    });
    echo.installHandlers(server, {prefix: '/socket'});

  }));
