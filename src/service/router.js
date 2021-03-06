var co       = require('co'),
    extend   = require('extend'),
    fs       = require('fs-extra'),
    path     = require('path'),
    request  = require('../lib/request'),
    response = require('../lib/response'),
    url      = require('url');

module.exports = co(function*() {

  /**
   * Handle native http requests
   *
   * @param {object} req
   * @param {object} res
   */
  var router = function ( req, res ) {
    return router.internal({
      request : req,
      response: res
    });
  };

  router.routes    = [];
  router.mimetypes = config.http.mimetypes;

  /**
   * Turns url-encoded queries into objects
   *
   * @param {String} str
   * @param {undefined|String} [separator]
   * @return {object}
   */
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

  /**
   * Turns a cookie into an object
   *
   * @param {String} str
   * @return {object}
   */
  router.parse_cookie = function ( str ) {
    return router.parse_query(str, ';');
  };

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
    var req    = request(options),
        res    = response(options),
        method = (options.method || req.method || 'get').toLowerCase(),
        parsed = url.parse(options.url || req.url || '/'),
        parts  = parsed.pathname.split('/').filter(function ( token ) {return !!token;}),
        time   = new Date();

    // Log
    config.http.log('info', method.toUpperCase(), parsed.pathname);

    // Default routes
    return co(function*() {

      // Loop through routes
      var key, route, valid;
      for ( key in router.routes ) {
        if ( res.finished ) break;
        valid = true;
        if ( !router.routes.hasOwnProperty(key) ) continue;
        route = router.routes[ key ];
        if ( !route.method ) continue;
        if ( !route.path ) continue;
        if ( !route.handler ) continue;

        // Filter by method
        if ( route.method != 'any' && route.method != method ) continue;

        // Filter path
        req.params = router.parse_query(parsed.query);

        // Fetch from body if post
        if ( method == 'post' && req.body && ( 'object' == typeof req.body ) ) {
          extend(req.params, req.body);
        }

        // Filter path & fetch path variables
        if ( route.path != '*' ) {
          var routeParts = route.path.split('/').filter(function ( part ) {return !!part;});
          if ( routeParts.length != parts.length ) continue;

          var index, indexes = Object.keys(routeParts);
          while ( index = indexes.shift() ) {
            switch ( routeParts[ index ].substr(0, 1) ) {
              case ':':
                set_deep(req.params, routeParts[ index ].substr(1), parts[ index ]);
                break;
              default:
                if ( routeParts[ index ] != parts[ index ] ) {
                  valid = false;
                  break;
                }
                break;
            }
          }
          if ( !valid ) continue;
        }

        // Make the call
        yield co.wrap(route.handler)(req, res);
      }
    })

      // static handler
      .then(co.wrap(function*() {
        if ( res.finished ) return;
        yield co.wrap(router._static)(req, res);
      }))

      // 404 handler
      .then(co.wrap(function*() {
        if ( res.finished ) return;
        yield co.wrap(router._404)(req, res);
      }))

  };

  router._static = function*( req, res ) {
    var docroot     = config.http.static_route,
        file, files = [],
        parsed      = url.parse(req.url);
    config.http.default_home.forEach(function ( filename ) {
      files.push(path.join(docroot, parsed.pathname, filename));
    });
    files.push(path.join(docroot, parsed.pathname + '.html'));
    files.push(path.join(docroot, parsed.pathname + '.htm'));
    files.push(path.join(docroot, parsed.pathname));
    while ( file = files.shift() ) {
      try {
        var data = yield fs.readFile(file);
        res.writeHeader(200, {
          'Content-Type': router.mimetypes[ file.split('.').pop() ] || 'application/octet-stream'
        });
        res.end(data);
        return;
      } catch ( e ) {
      }
    }
  };

  router._err = function*( req, res, number ) {
    var docroot     = config.http.static_route,
        file, files = [],
        bodies = {
          "403": "Permission Denied",
          "404": "Not Found",
        };
    if ( req.language ) files.push(path.join(docroot, req.language, number + '.html'));
    files.push(path.join(docroot, number+'.html'));
    while ( file = files.shift() ) {
      try {
        var data = yield fs.readFile(file);
        res.writeHeader(number, {
          'Content-Type': router.mimetypes[ file.split('.').pop() ] || 'application/octet-stream'
        });
        res.end(data);
        return;
      } catch ( e ) {}
    }
    res.writeHeader(number, {
      'Content-Type': 'text/plain'
    });
    res.end(bodies[number] || 'Internal Error');
  };

  router._403 = function*( req, res ) {
    return co.wrap(router._err)(req, res, 403);
  };

  router._404 = function*( req, res ) {
    return co.wrap(router._err)(req, res, 404);
  };

  return router;
});
