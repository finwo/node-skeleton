define(['api', 'jquery'], function(api, $) {

  // Fetch if we're logged in
  var authenticated = api.user.isLoggedIn();

  // Function to process data-auth elements
  function run() {
    $('[data-auth]').each(function() {
      var display = !parseInt($(this).attr('data-auth'));
      if ( authenticated ) display = !display;
      this.style.display = display ? null : 'none';
    });
  }

  // Listen to api events
  api.on('login', function() {
    authenticated = true;
    run();
  });
  api.on('logout', function() {
    authenticated = false;
    run();
  });

  // Initial run
  run();

  // Return a function indicating if we're authenticated
  return function() {
    return authenticated;
  };
});
