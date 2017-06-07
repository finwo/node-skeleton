var fs   = require('fs-extra'),
    path = require('path'),
    Q    = require('q');

// Helper function
function readdir( dir ) {
  var result = Q.defer();
  fs.readdir(dir, function(err, list) {
    var i = list.indexOf('index.js');
    if (i>=0) list.splice(i,1);
    result.resolve(list);
  });
  return result.promise;
}

// Register all routes
Q.fcall(Q.async(function* () {

  // Fetch router
  var router = yield service('router');

  // Register new 404 handler
  router.__404 = router._404;
  router._404  = function( req, res, route ) {
    req = req || res.request;
    res = res || req.response;
    var files = {};
    files[path.join(route+'.html')]            = 200;
    files[path.join(route+'.htm')]             = 200;
    files[path.join(req.language, '404.html')] = 404;
    var keys = Object.keys(files);
    (function next() {
      var filename = keys.shift();
      if (!filename) return router.__404( req, res, route );
      fs.readFile( path.join(config.http.static_route, filename), function(err, data) {
        if ( err ) return next();
        res.writeHead( files[filename], {
          'Content-Type': router.utils.mime_types[ '.' + filename.split('.').pop() ] || router.utils.mime_types['']
        });
        res.end(data);
      });
    })();
  };
  
  // Register new 405 handler
  router.__405 = router._405;
  router._405  = function( req, res, route ) {
    var files = config.http.default_home.map(function(filename) {
      return path.join( route, filename );
    }).filter(function(shortname) {
      try {
        var stat = fs.statSync(path.join(config.http.static_route, shortname));
        return stat.isFile();
      } catch(e) {
        return false;
      }
    });
    
    if(files.length) {
      return router.static(files.shift(), req, res);
    }
    
    return router.__405(req, res, route);
  };

  // Fetch file list
  var filelist = yield readdir(__dirname),
      filename;

  // Loop through files
  while(filename=filelist.shift()) {
    filename   = (filename || '').split('.');
    var ext    = filename.pop();
    filename   = filename.join('.');
    if(ext!='js') continue;

    // Load controller file
    var routes = yield require('./' + filename);

    // Register the given routes
    Object.keys(routes).forEach(function( key ) {
      var method = 'any',
          route  = key;
      if ( route.indexOf(' ') >= 0 ) {
        route  = route.split(' ', 2);
        method = route.shift();
        route  = route.shift();
      }
      if ( !router[method] ) {
        throw new Error("Invalid method '"+method+"'");
      }
      console.log('Route:', method, route);
      router[method](route, Q.async(routes[key]));
    });
  }
}));
