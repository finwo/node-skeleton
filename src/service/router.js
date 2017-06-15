var co  = require('co'),
    url = require('url');

module.exports = co(function*() {

  var router = function ( req, res ) {
    //  return router.internal({
    //    request : req,
    //    response: res
    //  });
  };

  router.routes = [];

  router.register = function ( route ) {
    if ( Array.isArray(route) ) {
      return route.map(router.register);
    }
    Object.keys(route).forEach(function(key) {
      var handlers = route[ key ],
          parts    = key.split(' '),
          method   = parts.shift().toLowerCase();
      parts        = parts.join('-');
      if ( !Array.isArray(handlers) ) {
        handlers = [ handlers ];
      }
      handlers.forEach(function ( handler ) {
        if ( 'function' != typeof handler ) return;
        console.log('Route:', method, parts);
        router.routes.push({
          method : method,
          path   : parts,
          handler: handler
        });
      });
    });
  };

  ////router.internal = function ( options ) {
  ////  var req    = options.request || {},
  ////      res    = options.response || {},
  ////      method = (options.method || req.method || 'get').toLowerCase(),
  ////      parsed = url.parse( options.url || req.url || '/' ),
  ////      parts  = parsed.pathname.split('/').filter(function(token) {return !!token;}),
  ////      time   = new Date();
  ////
  ////  config.http.log.handler(config.http.log.template.format({
  ////    'date'  : time,
  ////    'method': method,
  ////    'path'  : parsed.pathname
  ////  }));
  ////};
  ////
  ////router.parse_query = function( str, separator ) {
  ////
  ////};
  ////
  ////router.parse_cookie = function( str ) {
  ////  return router.parse_query(str,';');
  ////};

  return router;
});
