define([ 'api', 'notify-tt', 'rivets', 'translate', 'jquery', 'data-script' ], function ( api, notify, rivets, t, $ ) {

  // Log errors to the console (for now)
  api.on('error', function () { console.error(arguments) });

  // Configure rivets
  rivets.formatters           = rivets.formatters || {};
  rivets.formatters.or        = function ( value, arg ) { return value || arg; };
  rivets.formatters.prefix    = function ( value, arg ) { return value && ( '' + (arg || '') + value ); };
  rivets.formatters.translate = t;

  // More complex binders
  rivets.formatters.exclude = function ( value, arg ) {
    if ( !(arg&&value) ) return value||'';
    if ( 'string' == typeof value ) value = value.split(',');
    if ( 'number' == typeof value ) value = [ value ];
    if ( 'object' == typeof value && !Array.isArray(value) ) return value;
    if ( 'string' == typeof arg ) arg = arg.split(',');
    if ( 'number' == typeof arg ) arg = [ arg ];
    if ( 'object' == typeof arg && !Array.isArray(arg) ) arg = Object.keys(arg).filter(function ( key ) {return arg[ key ];});
    return value
      .filter(function(testValue) {
        return arg.indexOf(testValue) < 0;
      })
      .join(',');
  };

  // Bind the interface to the API
  rivets.bind(document.body, api);

  // Keep track of login status
  var authenticated = undefined;

  function updateAuth( status ) {
    if ( status.then ) return status.then(updateAuth);
    authenticated = !!status;
    $(document.body).toggleClass('auth', authenticated);
    $(document.body).toggleClass('unauth', !authenticated);
  }

  api.on('login', updateAuth.bind(null, true));
  api.on('logout', updateAuth.bind(null, false));
  updateAuth(api.user.isLoggedIn());

  //// Register notifications
  //(function () {
  //  api.on('error', function ( err ) {
  //    notify(( ('string' == typeof err.title) && err.title) || 'unknown-error', {
  //      body: err.description || 'unknown-error-body',
  //      icon: '/assets/img/logo_bare.png'
  //    });
  //  });
  //})();
  //
  //// Show-hide elements by authentication
  //(function () {
  //  // Handle authentication classes
  //  var authenticated = api.user.isLoggedIn();
  //  function updateAuth() {
  //    document.body.className += authenticated ? ' auth' : ' unauth';
  //    document.body.className =
  //      document.body.className
  //        .split(' ')
  //        .filter(function(token) {return !!token})
  //        .filter(function(token) {
  //          if ( authenticated )  return token != 'unauth';
  //          if ( !authenticated ) return token != 'auth';
  //          return true;
  //        })
  //        .join(' ');
  //  }
  //
  //  // Track authentication state
  //  api.on('login' , function () { authenticated = true ; updateAuth(); });
  //  api.on('logout', function () { authenticated = false; updateAuth(); });
  //  updateAuth();
  //})();

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
