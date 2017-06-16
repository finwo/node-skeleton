define([ 'notify', 'sockjs', 'translate', 'uid'], function(notify, SockJS, t, uid) {

  // Settings
  var uri = window.location.protocol + '//' + window.location.hostname;
  if ( window.location.port.length ) uri += ':' + window.location.port;
  uri += '/socket';

  // Initialize
  var sock = new SockJS(uri);
  sock.onopen  = function() { console.log('Connected');    };
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

    // Perform redirections
    if ( data.redirect ) {
      return window.location.href = data.redirect;
    }

    // Convert errors to events
    if ( data.error ) {
      data.event = {
        name: 'error',
        data: [ data.error ]
      };
      delete data.error;
    }

    // Events
    if ( data.event ) {
      var args = [ data.event.name ].concat(data.event.data);
      api.emit.apply({ bubble: false }, args);
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
      callbacks = [],
      listeners = {};

  // The actual API
  var api = {

    // Doing all the groundwork
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

    // Events
    on: function( name, callback ) {
      if ( Array.isArray(name) ) {
        return name.map(function(n) {
          return api.on( n, callback );
        });
      }
      if ( Array.isArray(callback) ) {
        return callback.map(api.on.bind(null,name));
      }
      (listeners[name] = listeners[name] || []).push(callback);
    },
    emit: function( name ) {
      var args = arguments;
      args = Object.keys(args).map(function(key) { return args[key]; });
      args.shift();
      (listeners[name]||[]).forEach(function(handler) {
        handler.apply(null, args);
      });
      if ( !this.hasOwnProperty('bubble') || this.bubble ) {
        api.raw({
          type: 'event',
          data: args
        });
      }
    },

  };

  // Attach error handler
  api.on('error', function(err) {
    notify(t( err.title || 'unknown-error' ), {
      body: t( err.description || 'unknown-error-body' ),
      icon: '/assets/img/logo_bare.png'
    });
  });

  return api;
});
