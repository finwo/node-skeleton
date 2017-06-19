define([ 'bluebird', 'notify', 'sockjs', 'translate', 'uid' ], function ( Promise, notify, SockJS, t, uid ) {

  // Settings
  var uri = window.location.protocol + '//' + window.location.hostname;
  if ( window.location.port.length ) uri += ':' + window.location.port;
  uri += '/socket';

  // Initialize
  var sock;
  function sock_init() {
    sock         = new SockJS(uri);
    sock.onopen  = function () {
      console.log('Connected');
      api.emit('connect');
    };
    sock.onclose = function () {
      console.log('Disconnected');
      api.emit.call({bubble: false}, 'disconnect');
      setTimeout(sock_init, 1000);
    };

    // Message receiver
    sock.onmessage = function ( e ) {
      try {
        var data = JSON.parse(e.data);
      } catch ( e ) {
        return notify(t('websocket-error'), {
          body: t('websocket-error-body'),
          icon: '/assets/img/logo_bare.png'
        });
      }

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

      // Keep cookie up-to-date
      if ( data.headers && data.headers.cookie ) {
        data.headers.cookie
          .split('; ')
          .map(function(token) { return token.split('='); })
          .forEach(function(token) {
            document.cookie = token.shift() + '=' + token.shift();
          });
      }

      // Handle callbacks
      if ( callbacks[data._id] ) {
        var cb = callbacks[data._id];
        if (data.finished) delete callbacks[data._id];
        data = data.body.length && data.body || data.data || null;
        return cb(data);
      }
    };
  }

  // Track state
  var callbacks = [],
      listeners = {};

  // The actual API
  var api = {

    // Doing all the groundwork
    raw: function ( data ) {
      data._id = uid();
      data.headers = data.headers || {};
      data.headers.cookie = data.headers.cookie || document.cookie;
      if ( data.callback ) {
        callbacks[ data._id ] = data.callback;
        delete data.callback;
      }
      sock.send(JSON.stringify(data));
      return data._id;
    },
    get: function( url, options ) {
      options = options || {};
      return new Promise(function( resolve, reject ) {
        api.raw({
          type    : 'request',
          method  : 'POST',
          url     : url,
          headers : options.headers || {},
          callback: function(data) {
            if ( data.status && ( data.status >= 300 || data.status < 200 ) ) {
              reject(data);
            } else {
              resolve(data);
            }
          }
        });
      });
    },
    post: function( url, options ) {
      options = options || {};
      return new Promise(function( resolve, reject ) {
        api.raw({
          type    : 'request',
          method  : 'POST',
          url     : url,
          headers : options.headers || {},
          body    : options.body    || options.data || '',
          callback: function(data) {
            if ( data.status && ( data.status >= 300 || data.status < 200 ) ) {
              reject(data);
            } else {
              resolve(data);
            }
          }
        });
      });
    },

    // Events
    on  : function ( name, callback ) {
      if ( Array.isArray(name) ) {
        return name.map(function ( n ) {
          return api.on(n, callback);
        });
      }
      if ( Array.isArray(callback) ) {
        return callback.map(api.on.bind(null, name));
      }
      (listeners[ name ] = listeners[ name ] || []).push(callback);
    },
    emit: function ( name ) {
      var args = arguments;
      args     = Object.keys(args).map(function ( key ) { return args[ key ]; });
      args.shift();
      (listeners[ name ] || []).forEach(function ( handler ) {
        handler.apply(null, args);
      });
      if ( !this.hasOwnProperty('bubble') || this.bubble ) {
        api.raw({
          type: 'event',
          name: name,
          data: args
        });
      }
    },

    // Collections
    user: {
      isLoggedIn: function() {
        return !!auth;
      },
      login: function(data) {
        return api.post( '/api/user/login', { data: data })
          .then(function( token ) {
            if ( token ) {
              api.emit.call({ bubble: false }, 'login', token );
              return token;
            }
            throw "login-failed";
          });
      },
      logout: function() {
        return new Promise(function(resolve) {
          api.emit.call({ bubble: false }, 'logout' );
          resolve(true);
        });
      }
    }

  };

  // Attach error handler
  api.on('error', function ( err ) {
    notify(t( ( ('string' == typeof err.title) && err.title) || 'unknown-error'), {
      body: t(err.description || 'unknown-error-body'),
      icon: '/assets/img/logo_bare.png'
    });
  });

  // Keep the auth cookie up-to-date
  api.on('login', function(token) { document.cookie = 'auth='+token; });
  api.on('logout', function() { document.cookie = 'auth='; });

  sock_init();
  return api;
});
