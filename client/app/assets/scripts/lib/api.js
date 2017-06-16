define([ 'notify', 'sockjs', 'translate', 'uid'], function(notify, SockJS, t, uid) {

  // Settings
  var uri = window.location.protocol + '//' + window.location.hostname;
  if ( window.location.port.length ) uri += ':' + window.location.port;
  uri += '/socket';

  // Initialize
  var sock = new SockJS(uri);
  sock.onopen  = function() { console.log('Connected');
    api.raw({
      foo: 'bar'
    });

  };
  sock.onclose = function() { console.log('Disconnected'); };

  // Message receiver
  sock.onmessage = function(e) {
    var raw  = e.data.split(' ', 2),
        id   = raw.shift(),
        data = raw.shift();

    // Decode
    try {
      data = JSON.parse(data);
    } catch ( e ) {
      return notify(t('websocket-error'), {
        body: t('websocket-error-body'),
        icon: '/assets/img/logo_bare.png'
      });
    }

    // Perform actions requested by the server

    // Display errors
    if ( data.error ) {
      return notify(t( data.error.title || 'unknown-error' ), {
        body: t( data.error.description || 'unknown-error-body' ),
        icon: '/assets/img/logo_bare.png'
      });
    }

    // Perform redirections
    if ( data.redirect ) {
      return window.location.href = data.redirect;
    }

    // Handle callbacks
    if ( callbacks[id] ) {
      var cb = callbacks[id];
      if (data.finished) delete callbacks[id];
      return cb(data);
    }
  };

  // Track state
  var auth      = false,
      callbacks = [];

  // The actual API
  var api = {
    raw: function(data) {
      var id = uid();
      if ( auth ) {
        data.auth = auth;
      }
      if ( data.callback ) {
        callbacks[id] = data.callback;
        delete data.callback;
      }
      sock.send(id + ' ' + JSON.stringify(data));
      return id;
    },
  };

  return api;
});
