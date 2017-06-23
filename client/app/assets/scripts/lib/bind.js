define([ 'jquery', 'api', 'bluebird', 'jquery-watch-dom' ], function ( $, api, Promise ) {

  var bindings = [],
      sources  = {
        api: api
      },
      filters  = {
        '=' : function( a, b ) { return a == b; },
        '!' : function( a, b ) { return a != b; },
        '>' : function( a, b ) { return a >  b; },
        '>=': function( a, b ) { return a >= b; },
        '<' : function( a, b ) { return a <  b; },
        '<=': function( a, b ) { return a <= b; }
      };

  function filter( test, value ) {
    var operator     = filters['='],
        compareValue = test;
    Object.keys(filters).forEach(function(key) {
      if ( test.substr(0,key.length) == key ) {
        operator     = filters[key];
        compareValue = test.substr(key.length);
      }
    });
    return operator( value, compareValue );
  }

  function setSourced( $el, keys ) {
    function out() {
      var key, path = keys.split('.');
      while(path.length) {
        key = path.shift();
        if ( path.length ) {
          sources = sources[key] = sources[key] || {};
        } else {
          sources[key] = $el.val();
        }
      }
      run();
    }
    out();
    return out;
  }

  function getData( path, src, apiData ) {
    src = apiData || src || sources;
    if ( 'string' == typeof path ) path = path.split('.');
    if ( !Array.isArray(path) ) return Promise.reject();
    var key = path.shift();
    if ( !key ) return Promise.resolve(src);
    switch(typeof src[key]) {
      case 'function':
        src = src[key]();
        if ( src.then ) {
          return src.then(getData.bind(null,path,src));
        }
        break;
      default:
        src = src[key];
        break;
    }
    if ( path.length ) return getData(path, src);
    return Promise.resolve(src);
  }

  function render( template ) {
    return function render_internal(data) {
      if ( Array.isArray(data) ) return data.map(render_internal).join('');
      if ( !template ) return data;
      return template.format(data);
    }
  }

  function process( binding ) {
    return function() {
      if ( !binding.key || !binding.element ) return;
      return getData(binding.key)
        .then(render(binding.template || ''))
        .then(function(output) {
          var eq, $el = $(binding.element);
          if ( eq = $el.attr('data-equals') ) {
            binding.element.style = binding.element.style || {};
            binding.element.style.display = filter(eq, output) ? null : 'none';
          } else {
            binding.element.innerHTML = output;
          }
        })
    }
  }

  // Our processor
  function run() {

    // Listen for new bindings
    $("[data-bind]").each(function() {
      var $this = $(this),
          key   = $this.attr('data-bind');
      this.removeAttribute('data-bind');
      bindings.push({
        element : this,
        key     : key,
        template: $this.attr('data-equals') ? false : this.innerHTML
      });
    });

    // Handle inputs as source
    $("[data-bind-source]").each(function() {
      var $this = $(this),
          key   = $this.attr('data-bind-source');
      this.removeAttribute('data-bind-source');
      $this.on('change', setSourced($this,key));
    });

    // Handle existing bindings
    var pipeline = Promise.resolve(true);
    bindings = bindings.filter(function(binding) {
      return document.body.contains(binding.element);
    });
    bindings.forEach(function(binding) {
      pipeline.then(process(binding));
    })
  }

  // Clear data on login/logout
  api.on([ 'login', 'logout' ], function() { cache = {}; });

  // Listen for dom changes
  run();
  $(document.body).watch({
    properties: "prop_innerHTML",
    callback: run
  });

  return true;
});
