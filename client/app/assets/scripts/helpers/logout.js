define(['api'], function(api) {
  return function($el) {
    $el.on('click', function() {
      api.user.logout();
      return false;
    });
  };
});
