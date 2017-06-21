define(function() {
  return function($el) {
    function update() {
      $el.toggleClass('has-content', !!$el.val().length );
    }
    $el.on('change keybress keyup click focus', update);
    update();
  };
});
