define(function() {
  var map = window.translations && window.translations[window._lang] || {};
  return function( key ) {
    return map[key] || key;
  };
});
