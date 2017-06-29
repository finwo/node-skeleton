define(function () {
  return function extend( origin ) {
    var args = arguments,
        obj  = null, prop;
    args     = Object.keys(args).map(function ( key ) {return args[ key ];});
    args.shift();
    while( obj = args.shift() ) {
      for ( prop in obj ) {
        if (!Object.prototype.hasOwnProperty.call(obj, prop)) continue;
        if ( 'object' == typeof origin[prop] && 'object' == typeof obj[prop] ) {
          extend( origin[prop], obj[prop] );
        } else {
          origin[prop] = obj[prop];
        }
      }
    }
    return origin;
  }
});
