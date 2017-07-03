define(function() {
  return function($el) {
    function update() {
      var val = $el.val();
      if ( 'undefined' == typeof val || val === null ) return;
      $el.toggleClass('has-content', !!val.length );
    }
    $el.on('change keybress keyup click focus', update);
    update();
  };
});
