define([ 'jquery' ], function ( $ ) {

  function process() {
    var timeout = 500;
    $('[data-script]').each(function () {
      var $el  = $(this),
          name = $el.attr('data-script');
      if (!name) return;
      this.removeAttribute('data-script');
      timeout = 100;
      require([ 'js/' + name ], function ( handler ) {
        handler($el);
      });
    });
    setTimeout(process, timeout);
  }

  setTimeout(process, 1);
  return true;
});
