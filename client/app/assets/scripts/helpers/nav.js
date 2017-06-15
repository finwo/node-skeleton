define(['jquery'], function($) {
  return function($el) {
    var $container = $el.find('.container'),
        $button    = $('<a href="#" class="icon">&#9776;</a>');
    $button.on('click', function() {
      $el.toggleClass('open');
    });
    $container.append($button);
  };
});
