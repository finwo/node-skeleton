module.exports = {};

var fs   = require('fs'),
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

function setDeep( subject, key, value ) {
  if ( 'string' === typeof key ) {
    key = key.split('.');
  }
  if ( !Array.isArray(key) ) {
    return;
  }
  var part;
  while ( key.length ) {
    part = key.shift();
    if ( key.length ) {
      subject = (subject[ part ] = subject[ part ] || {});
    } else {
      subject[ part ] = value;
    }
  }
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
    setDeep(module.exports, name, require(file));
  });
