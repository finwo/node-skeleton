(function(exports) {
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
    while( factory = factories.shift() ) {
      try { output = factory(); } catch (e) { continue; }
      break;
    }
    return output;
  }

  function load( name ) {
    if ( modules[name] || known[name] ) return;
    known[name] = true;
    var uri = exports.require.baseUri + name + '.js';
    if ( exports.require.paths[name] ) {
      if ( exports.require.paths[name].indexOf('://') >= 0 ) {
        uri = exports.require.paths[name];
      } else {
        uri = exports.require.baseUri + exports.require.paths[name];
      }
    }
    var req = xmlhttp();
    req.onreadystatechange = function() {
      if( req.readyState == 4 && req.status==200 ) {
        lastName = name;
        eval(req.responseText);
        var mapped = exports.require.getter[name] && exports.require.getter[name]();
        if (mapped) {
          exports.define(name,function() {
            return mapped;
          });
        }
      }
    };
    req.open('GET', uri, true );
    req.send();
  }

  function process() {
    var entry = queue.shift();
    if (!entry) return;
    var ready = true,
        args  = entry.o.map(function( name ) {
          if(!ready) return;
          if (modules[name]) {
            return modules[name];
          } else {
            load(name);
            ready = false;
            return null;
          }
        });
    if (ready) {
      var result = entry.f.apply( null, args );
      if ( entry.s ) {
        modules[entry.s] = result;
      }
    } else {
      queue.push(entry);
    }
    if (queue.length) setTimeout(process,10);
  }

  exports.require = function() {
    var args  = arguments,
        entry = { s: undefined, f: undefined, o: [] };
    Object.keys(args).forEach(function(key) {
      entry[(typeof args[key]).substr(0,1)] = args[key];
    });
    if ( ['string'  ,'undefined'].indexOf(typeof entry.s) < 0 ) return;
    if ( 'function' != typeof entry.f ) return;
    if ( !Array.isArray(entry.o) ) return;
    queue.push(entry);
    process();
  };

  exports.define = function() {
    var args  = arguments,
        entry = { s: lastName, f: undefined, o: [] };
    Object.keys(args).forEach(function(key) {
      entry[(typeof args[key]).substr(0,1)] = args[key];
    });
    exports.require.apply(null,Object.keys(entry).map(function(key) {return entry[key];}));
  };

  exports.require.amd     = true;
  exports.define.amd      = true;
  exports.require.baseUri = '';
  exports.require.paths   = {};
  exports.require.getter  = {};
})(window);
