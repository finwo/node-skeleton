module.exports = {};

var path   = require('path');

readdir(__dirname)
  .forEach(function ( file ) {
    file    = file.split('.');
    var ext  = file.pop(),
        name = file.join('.');
    switch(ext) {
      case 'json': 
      case 'js'  : file.push(ext); break;
      default    : return;
    }
    file     = file.join('.');
    if ( name.substr(0, __dirname.length) == __dirname ) {
      name = name.substr(__dirname.length + 1);
      name = name.split(path.sep).join('.');
    }
    set_deep(module.exports, name, require(file));
  });
