var co   = require('co'),
    fs   = require('fs-extra'),
    http = require('http');

// Initialize services & config
co(function*() {
  require('./src/helper');
  require('./src/service');
  global.approot = __dirname;
  global.config  = yield require('./config');
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

    //// HTTP daemon
    //var server = http.createServer(router);
    //server.listen(config.http.port);
    //console.log('Server running on port', config.http.port);
  }));
