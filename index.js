var co     = require('co'),
    colors = require('colors'),
    extend = require('extend'),
    http   = require('http'),
    sockjs = require('sockjs');

// Make sure promises exist
global.Promise = Promise || require('bluebird');

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
    var data      = config.database.bootstrapData,
        odm       = yield service('odm'),
        key, keys = Object.keys(data),
        model, current;
    while( key = keys.shift() ) {
      model   = yield odm.model( key, config.database.collections[key] || undefined );
      current = yield model.getAll();
      if (current.length) {
        console.log(current.length, key+'(s) found, not inserting bootstrap data');
      } else {
        console.log('No', key+'s', 'found, inserting bootstrap data');
        while(current = data[key].shift()) {
          yield model.insert(current);
        }
      }
    }
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
        var parts = message.split(' ', 2),
            id    = parts.shift(),
            data  = parts.shift();

        // Try to parse
        try {
          data = JSON.parse(data);
        } catch(e) {
          conn.write(id + ' ' + JSON.stringify({
            status: 400,
            error: {
              title      : 'websocket-error',
              description: 'websocket-error-body',
              details    : e && e.message || e
            }
          }));
        }

        // The data must have a type
        if (!data.type) {
          conn.write(id + ' ' + JSON.stringify({
              status: 400,
              error: {
                title      : 'bad-request',
                description: 'bad-request-body'
              }
            }));
        }

        console.log(data);
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
