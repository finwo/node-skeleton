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
