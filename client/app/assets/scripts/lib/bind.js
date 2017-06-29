define([ 'watch', 'rivets', 'api', 'extend' ], function ( w, rivets, api, extend ) {

  //// Keep track of bindings
  //var bindings = [],
  //    sources  = {
  //      api  : api
  //    };
  //
  //function getData(options, apiData) {
  //  options     = options || {};
  //  options.src = apiData || options.src || sources;
  //
  //}
  //
  //// Processor
  //function process() {
  //
  //  // Register new elements
  //  var elements = document.querySelectorAll('[data-bind]');
  //  Object.keys(elements).forEach(function ( key ) {
  //    var element = elements[ key ];
  //    bindings.push({
  //      path   : element.getAttribute('data-bind') || 'null',
  //      element: element
  //    });
  //    element.removeAttribute('data-bind');
  //  });
  //
  //  // Handle bindings
  //  bindings.forEach(function(binding) {
  //    console.log(binding);
  //    getData(binding);
  //  });
  //
  //}
  //
  ////// Start our watcher
  //w.watch(document.body, "innerHTML", process);
  //process();
  return true;
});
