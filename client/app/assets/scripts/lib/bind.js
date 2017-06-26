define([ 'jquery', 'api', 'bluebird', 'jquery-watch-dom' ], function ( $, api, Promise ) {

  var bindings = [],
      busy     = false,
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
      var subject   = sources,
          key, path = keys.split('.');
      while(path.length) {
        key = path.shift();
        if ( path.length ) {
          subject = subject[key] = subject[key] || {};
        } else {
          subject[key] = $el.val();
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
      var template = binding.template || '',
          pipeline = Promise.resolve(true);

      console.log(template);

      // Process sub-bindings first, non-tracking
      if ( template.indexOf('data-bind') >= 0 ) {
        var virt = $('<div>' + template + '</div>');
        virt.find('[data-bind]').each(function () {
          var self  = this,
              $self = $(self),
              key   = $self.attr('data-bind');
          self.removeAttribute('data-bind');
          pipeline
            .then(function () {
              return process({
                element : self,
                key     : key,
                template: self.innerHTML
              });
            })
            .then(function () {
              template = virt.html();
            })
        })
      }

      return getData(binding.key)
        .then(render(template))
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
    if ( busy ) return;
    busy = true;

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
    });
    pipeline.then(function() {
      busy = false;
    });
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
