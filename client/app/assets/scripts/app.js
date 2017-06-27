define(['api', 'jquery', 'notify-tt', 'autocomplete', 'data-script', 'bind'], function(api, $, notify) {

  // Register notifications
  (function() {
    api.on('error', function ( err ) {
      notify( ( ('string' == typeof err.title) && err.title) || 'unknown-error', {
        body: err.description || 'unknown-error-body',
        icon: '/assets/img/logo_bare.png'
      });
    });
  })();

  // Show-hide elements by authentication
  (function() {
    // Handle authentication classes
    var authenticated = api.user.isLoggedIn();
    function updateAuth() {
      $('body')
        .toggleClass('auth', authenticated)
        .toggleClass('unauth', !authenticated);
    }

    // Track authentication state
    api.on('login' , function() { authenticated = true ; updateAuth(); });
    api.on('logout', function() { authenticated = false; updateAuth(); });
    updateAuth();
  })();

  return true;
});
