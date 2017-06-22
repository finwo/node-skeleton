define(['jquery'], function($) {
  return function($el) {
    var $container = $el.find('.container'),
        $title     = $el.find('.title'),
        $button    = $('<a href="#" class="icon">&#9776;</a>');
    function toggle() {
      $el.toggleClass('open');
    }
    $button.on('click', toggle);
    $title.on('click', toggle);
    $container.append($button);
  };
});
