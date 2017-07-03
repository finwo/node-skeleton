define([ 'jquery' ], function ( $ ) {
  return function ( $el ) {
    if ( $el.is('a:not(:last-child)') ) {
      $el.on('click', $.fn.toggleClass.bind($el, 'open'));
    }
  };
});
