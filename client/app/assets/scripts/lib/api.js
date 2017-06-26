define([ 'bluebird', 'notify', 'sockjs', 'translate', 'uid' ], function ( Promise, notify, SockJS, t, uid ) {

  // Settings
  var uri = window.location.protocol + '//' + window.location.hostname;
  if ( window.location.port.length ) uri += ':' + window.location.port;
  uri += '/socket';

  function getCookie(name) {
    return document.cookie
      .split('; ')
      .map(function(token) { return token.split('=', 2); })
      .map(function(token) { return { key: token.shift(), value: token.shift() }; })
      .filter(function(token) { return token.key == name })
      .map(function(token) { try { return {key: token.key, value: JSON.parse(token.value)}; } catch(e) {return token;} })
      .map(function(token) { return token.value; })
      .shift()
  }

  // Initialize
  var sock, connected = false;
  function sock_init() {
    sock         = new SockJS(uri);
    sock.onopen  = function () {
      console.log('Connected');
      connected = true;
      api.emit('connect');
      if ( outbox.length ) {
        api.emit.call({bubble: false}, 'queue');
      }
    };
    sock.onclose = function () {
      console.log('Disconnected');
      connected = false;
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
            document.cookie = token.shift() + '=' + token.shift() + '; path=/';
          });
      }

      // Handle callbacks
      if ( callbacks[data._id] ) {
        var cb = callbacks[data._id];
        if (data.finished) delete callbacks[data._id];
        data = data.body.length && data.body || data.data;
        return cb(data);
      }
    };
  }

  // Track state
  var callbacks = [],
      listeners = {},
      outbox    = [];

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
      outbox.push(JSON.stringify(data));
      api.emit.call({ bubble: false }, 'queue');
      return data._id;
    },
    get: function( url, options ) {
      options = options || {};
      return new Promise(function( resolve, reject ) {
        api.raw({
          type    : 'request',
          method  : 'GET',
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
        var cookie = getCookie('auth');
        return !!(cookie && cookie.length || false);
      },
      login: function(data) {
        return api.post( '/api/user/login', { data: data })
          .then(function( token ) {
            if (Array.isArray(token)) token = token.shift();
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
      },

      me: function() {
        if ( !api.user.isLoggedIn() ) return Promise.reject(false);
        return api.get( '/api/user/me')
          .then(function(result) {
            if (!result) throw result;
            return result;
          });
      }
    }

  };

  // Keep the auth cookie up-to-date
  api.on('logout', function()      { document.cookie = 'auth=; path=/'; });
  api.on('login' , function(token) { document.cookie = 'auth='+token+'; path=/'; });

  // Transmit messages in the outbox
  api.on('queue', function() {
    if ( !connected ) {
      return setTimeout(api.emit.bind({bubble:false}, 'emit'), 100);
    }
    var msg = outbox.shift();
    if (!msg) {
      return;
    }
    sock.send(msg);
    if ( outbox.length ) {
      setTimeout(api.emit.bind({bubble:false}, 'emit'), 5);
    }
  });

  sock_init();
  return api;
});
