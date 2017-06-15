var co = require('co'),
    fs = require('fs-extra');

module.exports = co(function*() {
  var files = yield fs.readdir(__dirname);
  files     = files.filter(function ( file ) {return file != 'index.js';});
  return files.map(function(filename) {
    if ( !filename ) return [];
    var name = filename.split('.'),
        ext  = name.pop();
    name     = name.join('.');
    if ( 'js' != ext ) return [];
    return require('./' + name);
  });
});
