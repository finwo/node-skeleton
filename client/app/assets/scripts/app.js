define(['api', 'jquery', 'translate'], function(api, $, t) {

  // Show login notification
  api.on('login', function() {
    notify(t('login-successful'), {
      body: t('login-successful-body'),
      icon: '/assets/img/logo_bare.png'
    });
  });

  // Attach error handler
  api.on('error', function ( err ) {
    notify(t( ( ('string' == typeof err.title) && err.title) || 'unknown-error'), {
      body: t(err.description || 'unknown-error-body'),
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
