define([ 'bind', 'jquery', 'jquery-watch-dom', 'jquery-autocomplete' ], function ( bind, $ ) {

  // Our processor
  function process() {
    $("[data-autocomplete]").each(function () {
      var $this = $(this),
          key   = $this.attr('data-autocomplete');
      $this.removeAttr('data-autocomplete');
      $this.autoComplete({
        minChars: $this.attr('data-min-chars') || 1,
        source  : function ( term, suggest ) {
          bind({
            path     : key,
            apiParams: {
              q: term
            }
          }).then(suggest)
        }
      });
    });
  }

  // Listen for new elements
  $(document.body).watch({
    properties: "prop_innerHTML",
    callback  : process
  });

  // Make an initial call
  process();

  return true;
});

