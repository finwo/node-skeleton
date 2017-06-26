String.prototype.format = function ( data ) {
  var str      = this,
      flatData = {};
  switch ( typeof data ) {
    case 'string':
      var args = arguments;
      return this.replace(/{(\d+)}/g, function ( match, number ) {
        return typeof args[ number ] != 'undefined'
          ? args[ number ]
          : match
          ;
      });
      break;
    case 'object':
      (function flatten( obj, prefix ) {
        obj    = obj || data;
        prefix = prefix || '';
        Object.keys(obj).forEach(function ( key ) {
          var compositeKey = prefix + key;
          switch ( typeof obj[ key ] ) {
            case 'string':
            case 'number':
              flatData[ compositeKey ] = obj[ key ];
              break;
            case 'object':
              flatData[ compositeKey ] = JSON.stringify(obj[ key ]);
              flatten(obj[ key ], compositeKey + '.');
              break;
          }
        });
      })();
      return str.replace(/\{([\w_]+(\.[\w_])*(\|[\w_]+(\.[\w_])*)*)}/g, function ( full, match ) {
        var matches = match.split('|'),
            result  = false;
        matches.forEach(function ( key ) {
          result = result || flatData[ key ];
        });
        return result || match;
      });
  }
};
