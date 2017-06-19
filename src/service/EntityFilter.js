var co       = require('co'),
    through2 = require('through2');

module.exports = co(function*() {

  var operators = {
    '=' : function( a, b ) { return a == b; },
    '!' : function( a, b ) { return a != b; },
    '>=': function( a, b ) { return a >= b; },
    '<=': function( a, b ) { return a <= b; },
    '>' : function( a, b ) { return a >  b; },
    '<' : function( a, b ) { return a <  b; }
  };

  function match( a, b ) {
    var operator = Object.keys(operators).shift();
    Object.keys(operators).forEach(function ( key ) {
      if ( b.substr(0, key.length) == key ) {
        operator = key;
        b        = b.substr(key.length);
      }
    });
    return operators[operator]( a, b );
  }

  var f = function(filter) {
    return function(entities) {
      if (!Array.isArray(entities)) return [];
      return entities.filter(function(entity) {
        var key, keys = Object.keys(filter);
        while(key = keys.shift()) {
          if (!entity.hasOwnProperty(key)) return false;
          if (!match(entity[key], filter[key])) return false;
          return true;
        }
      });
    };
  };

  f.piped = function(filter) {
    return through2({ objectMode: true }, function( chunk, enc, callback ) {
      f(filter)([chunk]).forEach(this.push);
      callback();
    });
  };

  return f;
});
