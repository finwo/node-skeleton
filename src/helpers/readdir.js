var fs   = require('fs-extra'),
    path = require('path');

module.exports = function readdir( dir, recursive ) {
  if ( 'undefined' == typeof recursive ) {
    recursive = true;
  } else {
    recursive = !!recursive;
  }
  var output = [];
  try {
    fs.readdirSync(dir)
      .forEach(function ( entry ) {
        if ( entry == 'index.js' ) {
          return [];
        }
        var fullPath = path.join(dir, entry),
            stat     = fs.statSync(fullPath);
        if ( stat.isDirectory() ) {
          if ( recursive ) {
            output = output.concat(readdir(fullPath, recursive));
          }
        } else if ( stat.isFile() ) {
          output.push(fullPath);
        }
      });
  } catch ( e ) {
    console.log('ERROR', e)
    return [];
  }
  return output;
};