define([ 'api', 'notify-tt', 'data-script' ], function ( api, notify ) {

  // Register notifications
  (function () {
    api.on('error', function ( err ) {
      notify(( ('string' == typeof err.title) && err.title) || 'unknown-error', {
        body: err.description || 'unknown-error-body',
        icon: '/assets/img/logo_bare.png'
      });
    });
  })();

  // Show-hide elements by authentication
  (function () {
    // Handle authentication classes
    var authenticated = api.user.isLoggedIn();

    function updateAuth() {
      document.body.className += authenticated ? ' auth' : ' unauth';
      document.body.className =
        document.body.className
          .split(' ')
          .filter(function(token) {return !!token})
          .filter(function(token) {
            if ( authenticated )  return token != 'unauth';
            if ( !authenticated ) return token != 'auth';
            return true;
          })
          .join(' ');
    }

    // Track authentication state
    api.on('login', function () {
      authenticated = true;
      updateAuth();
    });
    api.on('logout', function () {
      authenticated = false;
      updateAuth();
    });
    updateAuth();
  })();

  ////// Fix label clicks
  ////$("input[type=checkbox], input[type=radio]").each(function() {
  ////  if ( !this.id ) return;
  ////  var chk = this;
  ////  $("label[for="+this.id+"]").on('click', function(e) {
  ////    e && e.preventDefault  && e.preventDefault();
  ////    e && e.stopPropagation && e.stopPropagation();
  ////    chk.checked = !chk.checked;
  ////    return false;
  ////  });
  ////});

  return true;
});
