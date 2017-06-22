define(['api', 'jquery', 'notify-tt'], function(api, $, notify) {

  // Show login notification
  api.on('login', function() {
    notify('login-successful', {
      body: 'login-successful-body',
      icon: '/assets/img/logo_bare.png'
    });
  });

  // Attach error handler
  api.on('error', function ( err ) {
    notify( ( ('string' == typeof err.title) && err.title) || 'unknown-error', {
      body: err.description || 'unknown-error-body',
      icon: '/assets/img/logo_bare.png'
    });
  });

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

  return true;
});
