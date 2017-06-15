var co   = require('co'),
    fs   = require('fs-extra'),
    path = require('path');

var extensions = ['js','json'];

module.exports = co(function*() {
  var loaded = {};

  // Fetch files to load
  var files = yield fs.scandir( __dirname );
  files = files.filter(function(filename) {
    return (filename != __filename) && ( extensions.indexOf( filename.split('.').pop() ) >= 0 );
  });
  
  // Load them all
  var name, file;
  while(file=files.shift()) {
    name = file.split('.');
    name.pop();
    name = name.join('.').substr(__dirname.length+1);
    name = name.split(path.sep).join('.');
    set_deep( loaded, name, yield require(file) );
  }
  
  // Output our findings
  return loaded;
});
