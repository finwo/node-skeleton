var co  = require('co'),
    url = require('url');

module.exports = co(function*() {

  function lpad( subject, length, padding ) {
    padding = padding || ' ';
    while ( subject.length < length ) subject = padding + subject;
    return subject.substr(-length);
  }

  var router = function ( req, res ) {
    return router.internal({
      request : req,
      response: res
    });
  };

  router.routes = [];

  router.register = function ( route ) {
    if ( Array.isArray(route) ) {
      return route.map(router.register);
    }
    Object.keys(route).forEach(function ( key ) {
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

  router.internal = function ( options ) {
    var req    = options.request || {},
        res    = options.response || {},
        method = (options.method || req.method || 'get').toLowerCase(),
        parsed = url.parse(options.url || req.url || '/'),
        parts  = parsed.pathname.split('/').filter(function ( token ) {return !!token;}),
        time   = new Date();

    // Log
    config.http.log.handler(config.http.log.template.format({
      'date'        : '' + time,
      'day'         : lpad('' + time.getUTCDate(), 2, '0'),
      'hour'        : lpad('' + time.getUTCHours(), 2, '0'),
      'method'      : method,
      'minute'      : lpad('' + time.getUTCMinutes(), 2, '0'),
      'milliseconds': lpad('' + time.getUTCMilliseconds(), 3, '0'),
      'month'       : lpad('' + (time.getUTCMonth() + 1), 2, '0'),
      'path'        : parsed.pathname,
      'seconds'     : lpad('' + time.getUTCSeconds(), 2, '0'),
      'year'        : lpad('' + time.getUTCFullYear(), 4, '0'),
    }));

  };

  router.parse_query = function ( str, separator ) {
    separator  = separator || '&';
    str        = str || '';
    var output = {};
    str
      .split(separator)
      .map(Function.prototype.call, String.prototype.trim)
      .forEach(function ( part ) {
        part = part.split('=', 2);
        if ( part.length != 2 ) return;
        set_deep(
          output,
          decodeURIComponent(part.shift()).replace(/\]/g, ''),
          decodeURIComponent(part.shift()),
          '['
        );
      });
    return output;
  };

  router.parse_cookie = function ( str ) {
    return router.parse_query(str, ';');
  };

  return router;
});
