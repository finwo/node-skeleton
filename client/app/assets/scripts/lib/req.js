// Prototype extensions
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
          var compositeKey = prefix + key,
              type         = typeof obj[ key ];
          switch ( type ) {
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

(function ( e ) {
  var modules  = {},
      known    = {},
      queue    = [],
      lastName = '';

  function xmlhttp() {
    var output             = false,
        factory, factories = [
          function () {return new XMLHttpRequest()},
          function () {return new ActiveXObject("Msxml2.XMLHTTP")},
          function () {return new ActiveXObject("Msxml3.XMLHTTP")},
          function () {return new ActiveXObject("Microsoft.XMLHTTP")}
        ];
    while ( factory = factories.shift() ) {
      try {
        output = factory();
      } catch ( e ) {
        continue;
      }
      break;
    }
    return output;
  }

  function load( name ) {
    if ( modules[ name ] || known[ name ] ) return;
    known[ name ] = true;
    var uri       = e.require.baseUri + name + '.js';
    if ( e.require.paths[ name ] ) {
      if ( e.require.paths[ name ].indexOf('://') >= 0 ) {
        uri = e.require.paths[ name ];
      } else {
        uri = e.require.baseUri + e.require.paths[ name ];
      }
    }
    var req                = xmlhttp();
    req.onreadystatechange = function () {
      if ( req.readyState == 4 && req.status == 200 ) {
        lastName = name;
        eval(req.responseText);
        var mapped = e.require.getter[ name ] && e.require.getter[ name ]();
        if ( mapped ) {
          e.define(name, function () {
            return mapped;
          });
        }
      }
    };
    req.open('GET', uri, true);
    req.send();
  }

  function process() {
    var entry = queue.shift();
    if ( !entry ) return;
    var exports = {},
        ready   = true,
        args    = entry.o.map(function ( name ) {
          if ( !ready ) return;
          if ( name == 'exports' ) {
            return exports;
          }
          if ( modules[ name ] ) {
            return modules[ name ];
          } else {
            load(name);
            ready = false;
            return null;
          }
        });
    if ( ready ) {
      var result = entry.f.apply(null, args);
      if ( entry.s ) {
        modules[ entry.s ] = Object.keys(exports).length ? exports : result;
      }
    } else {
      queue.push(entry);
    }
    if ( queue.length ) setTimeout(process, 10);
  }

  e.require = function () {
    var args  = arguments,
        entry = { s: undefined, f: undefined, o: [] };
    Object.keys(args).forEach(function ( key ) {
      entry[ (typeof args[ key ]).substr(0, 1) ] = args[ key ];
    });
    if ( [ 'string', 'undefined' ].indexOf(typeof entry.s) < 0 ) return;
    if ( 'function' != typeof entry.f ) return;
    if ( !Array.isArray(entry.o) ) return;
    queue.push(entry);
    process();
  };

  e.define = function () {
    var args  = arguments,
        entry = { s: lastName, f: undefined, o: [] };
    Object.keys(args).forEach(function ( key ) {
      entry[ (typeof args[ key ]).substr(0, 1) ] = args[ key ];
    });
    e.require.apply(null, Object.keys(entry).map(function ( key ) {return entry[ key ];}));
  };

  e.require.amd     = true;
  e.define.amd      = true;
  e.require.baseUri = '';
  e.require.paths   = {};
  e.require.getter  = {};
})(window);
