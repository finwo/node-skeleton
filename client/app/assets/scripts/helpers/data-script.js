define(['jquery', 'jquery-watch-dom'], function($) {

  // Our processor
  function process() {
    $("[data-script]").each(function() {
      var $this  = $(this),
          script = $this.attr('data-script');
      $this.removeAttr('data-script');
      require(['js/'+script], function( module ) {
        module && module($this);
      });
    });
  }

  // Listen for new elements
  $(document.body).watch({
    properties: "prop_innerHTML",
    callback: process
  });

  // Make an initial call
  process();

});
