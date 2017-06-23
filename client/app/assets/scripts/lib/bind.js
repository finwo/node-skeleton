define([ 'jquery', 'api', 'bluebird', 'jquery-watch-dom' ], function ( $, api, Promise ) {

  var bindings = [];

  function getData( path, src, apiData ) {
    src = apiData || src || api;
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
      if ( !template ) return ('string' == typeof data) ? data : JSON.stringify(data);
      return template.format(data);
    }
  }

  function process( binding ) {
    return function() {
      if ( !binding.key || !binding.element ) return;
      return getData(binding.key)
        .then(render(binding.template || ''))
        .then(function(output) {
          binding.element.innerHTML = output;
        })
    }
  }

  // Our processor
  function run() {

    // Listen for new bindings
    $("[data-bind]").each(function() {
      var key = $(this).attr('data-bind');
      this.removeAttribute('data-bind');
      bindings.push({
        element : this,
        key     : key,
        template: this.innerHTML
      });
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
