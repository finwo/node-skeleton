define(['api'], function(api) {
  return function($el) {

    //function set_deep( obj, path, value ) {
    //  if ( 'string' == typeof path ) path = path.split('.').filter(function(t){return !!t;});
    //  if ( !Array.isArray(path) ) return false;
    //  var key;
    //  while(path.length) {
    //    key = path.shift();
    //    if ( path.length ) {
    //      obj = obj[key] = obj[key] || {};
    //    } else {
    //      obj[key] = value;
    //    }
    //  }
    //}
    //
    //// Fetch info
    //var method = ($el.attr('method') || 'POST').toUpperCase(),
    //    action = ($el.attr('action') || false);
    //if (!action) return;
    //action = action.split('.').filter(function(token) {return !!token;});
    //
    //// Make the submit button trigger the form submit
    //$el.find('[data-action=submit], button[type=submit]').on('click', function(e) {
    //  $el.trigger('submit');
    //  return false;
    //});
    //
    //// Handle form submit
    //$el.on('submit', function(e) {
    //
    //  // Fetch data
    //  var rawData = $el.serializeArray(),
    //      data    = {};
    //  rawData.forEach(function(token) {
    //    set_deep(data, token.name, token.value);
    //  });
    //
    //  // Fetch what to call
    //  var call = api;
    //  action.forEach(function(token) {
    //    call = call[token] || function(){};
    //  });
    //
    //  // Perform api call
    //  call(data)
    //    .then(function() {
    //      document.location.hash = '#!';
    //    });
    //  return false;
    //});
  };
});
