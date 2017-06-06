var extend = require('extend');

module.exports = function ( subject, key, value ) {
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
      if ( subject[part] && 'object' == typeof value ) {
        extend(subject[part], value);
      } else {
        subject[ part ] = value;
      }
    }
  }
};
