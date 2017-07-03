define([ 'jquery' ], function ( $ ) {
  return function ( $el ) {

    function toggleOpen() {
      $(this).toggleClass('open');
    }

    var $container = $el.find('.container'),
        $title     = $el.find('.title'),
        $button    = $($el.find('.icon').get(0) || '<a href="#!" class="icon">&#9776;</a>');
    $button.on('click', toggleOpen.bind($el));
    $title.on('click', toggleOpen.bind($el));
    $container.append($button);
  };
});
