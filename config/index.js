module.exports = {};

var fs   = require('fs-extra'),
    path = require('path');

function readdir( dir ) {
  var output = [];
  try {
    fs.readdirSync(dir)
      .forEach(function ( entry ) {
        if ( dir == __dirname && entry == 'index.js' ) {
          return;
        }
        var fullPath = path.join(dir, entry),
            stat     = fs.statSync(fullPath);
        if ( stat.isDirectory() ) {
          output = output.concat(readdir(fullPath));
        } else if ( stat.isFile() ) {
          output.push(fullPath);
        }
      });
  } catch ( e ) {
    return;
  }
  return output;
}

readdir(__dirname)
  .forEach(function ( file ) {
    file    = file.split('.');
    var ext = file.pop();
    if ( ext !== 'js' ) {
      return;
    }
    file     = file.join('.');
    var name = file;
    if ( name.substr(0, __dirname.length) == __dirname ) {
      name = name.substr(__dirname.length + 1);
      name = name.split(path.sep).join('.');
    }
    set_deep(module.exports, name, require(file));
  });
