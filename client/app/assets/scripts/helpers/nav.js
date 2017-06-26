define(['jquery'], function($) {
  return function($el) {

    // Make it responsive
    var $container = $el.find('.container'),
        $title     = $el.find('.title'),
        $button    = $('<a href="#!" class="icon">&#9776;</a>');
    function toggle(el) {
      el = el || $el;
      el.toggleClass('open');
    }
    $button.on('click', toggle);
    $title.on('click', toggle);
    $container.append($button);

    // Handle dropdowns
    $el.find('a:not(:last-child)').each(function() {
      var $this = $(this);
      $this.on('click', toggle.bind(null,$this));
    });
  };
});
