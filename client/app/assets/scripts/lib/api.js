define([ 'query', 'events', 'sockjs', 'bluebird', 'uid', 'rivets' ], function ( query, EventEmitter, SockJS, Promise, uid, rivets ) {

  // Helper functions
  function getCookie( name ) {
    var data = query.decode(document.cookie, '; ');
    return data[ name ] || undefined;
  }

  // SockJS connection
  var sock, connected = false;

  function sock_init() {
    var sockurl = window.location.protocol + '//' + window.location.hostname;
    if ( window.location.port.length ) sockurl += ':' + window.location.port;
    sockurl += '/socket';
    sock           = new SockJS(sockurl);
    sock.onopen    = function () {
      connected = true;
      api.emit('connect');
    };
    sock.onclose   = function () {
      sock      = false;
      connected = false;
      api.emit('disconnect');
    };
    sock.onmessage = function ( e ) {
      try {
        var data = JSON.parse(e.data);
      } catch ( e ) {
        return api.emit('error', 'websocket-error');
      }
      if ( data.redirect ) {
        return window.location.href = data.redirect;
      }
      if ( data.error ) {
        data.event = {
          name: 'error',
          data: [ data.error ]
        };
        delete data.error;
      }
      if ( data.event ) {
        var bubble = api.bubble;
        api.emit.apply(api, [ data.event.name || '' ].concat(data.event.data || []));
        api.bubble = bubble;
      }
      if ( data.headers && data.headers.cookie ) {
        data.headers.cookie
          .split('; ')
          .map(function ( token ) { return token.split('='); })
          .forEach(function ( token ) {
            document.cookie = token.shift() + '=' + token.shift() + '; path=/';
          });
      }
      // Handle callbacks
      if ( data._id && callbacks[ data._id ] ) {
        callbacks[ data._id ](data);
        if ( data.finished ) delete callbacks[ data._id ];
        return;
      }
    };
  }

  // Build the api object
  var callbacks = {},
      outbox    = [],
      observers = [],
      api       = EventEmitter.mixin({
        bubble: true,

        // Raw call
        raw: function ( data ) {
          data._id             = uid();
          data.headers        = data.headers || {};
          data.headers.cookie = data.headers.cookie || document.cookie;
          if ( data.callback ) {
            callbacks[ data._id ] = data.callback;
            delete data.callback;
          }
          outbox.push(JSON.stringify(data));
          api.emit('queue');
        },

        // Routed
        routed: function ( url, options ) {
          return new Promise(function ( resolve, reject ) {
            options          = options || {};
            options.method   = options.method || 'GET';
            options.url      = options.url || url;
            options.headers  = options.headers || {};
            options.callback = function ( data ) {
              if ( data.status && ( data.status >= 300 || data.status < 200 ) ) {
                reject( (data&&data.body) || (data&&data.data) || data );
              } else {
                resolve( (data&&data.body) || (data&&data.data) || data );
              }
            };
            api.raw(options);
          });
        },
        get   : function ( url, options ) {
          return api.routed(url, options);
        },
        post  : function ( url, options ) {
          options        = options || {};
          options.method = options.method || 'POST';
          options.body   = options.body || options.data || '';
          return api.get(url, options);
        },
        put   : function ( url, options ) {
          options        = options || {};
          options.method = options.method || 'PUT';
          return api.post(url, options);
        },

        // NAV model
        nav: EventEmitter.mixin({
          data: {},
          all: function () {
            return api
              .get('/api/nav/all')
              .then(function(data) {
                api.nav.emit('data:all', data);
                api.nav.data.all = data;
                return data;
              })
          }
        })
      });

  // Track states
  api.on('connect', api.emit.bind(api, 'queue'));
  api.on('logout', function () {
    cache           = {};
    document.cookie = 'auth=; path=/';
  });
  api.on('login', function ( token ) {
    cache           = {};
    document.cookie = 'auth=' + token + '; path=/';
  });

  // Bubble events to the server
  api.on('*', function ( name ) {
    if ( [ 'connect', 'disconnect', 'queue' ].indexOf(name) >= 0 ) return;
    if ( !this.bubble ) return;
    var data = arguments;
    data     = Object.keys(data).map(function ( key ) {return data[ key ];});
    data.shift();
    api.raw({ type: 'event', name: name, data: data })
  });

  // Handle outbox & connect if needed
  api.on('queue', function () {
    if ( !sock ) return setTimeout(sock_init, 100);
    if ( !connected ) setTimeout(api.emit.bind(api, 'queue'), 100);
    var msg = outbox.shift();
    if ( !msg ) return;
    sock.send(msg);
    if ( outbox.length ) setTimeout(api.emit.bind(api, 'queue'), 5);
  });

  // Tell rivets how to use our api
  rivets.adapters[':'] = {
    observe: function(obj, keypath, callback) {
      obj.on('data:'+keypath, callback);
    },
    unobserve: function(obj, keypath, callback) {
      obj.off('data:'+keypath, callback);
    },
    get: function( obj, keypath ) {
      if(!obj.data[keypath]) {
        obj[keypath]();
      }
      return obj.data[keypath];
    },
    set: function( obj, keypath, value ) {
      obj.data[keypath] = value;
      obj.emit('data:'+keypath, value);
    }
  };

  // Return our module
  return api;
});

//define([ 'bluebird', 'notify-tt', 'sockjs', 'translate', 'uid', 'query' ], function ( Promise, notify, SockJS, t, uid, query ) {
//
//
//  // Track state
//  var callbacks = [],
//      listeners = {},
//      outbox    = [],
//      cache     = {};
//
//  // The actual API
//  var api = {
//
//    // Collections
//    user: {
//      isLoggedIn: function() {
//        var cookie = getCookie('auth');
//        return !!(cookie && cookie.length || false);
//      },
//      login: function(data) {
//        return api.post( '/api/user/login', { data: data })
//          .then(function( token ) {
//            if (Array.isArray(token)) token = token.shift();
//            if ( token ) {
//              api.emit.call({ bubble: false }, 'login', token );
//              return token;
//            }
//            throw "login-failed";
//          });
//      },
//      logout: function() {
//        return new Promise(function(resolve) {
//          api.emit.call({ bubble: false }, 'logout' );
//          resolve(true);
//        });
//      },
//
//      me: function() {
//        if ( !api.user.isLoggedIn() ) return Promise.reject(false);
//        if ( cache['user.me'] ) return Promise.resolve(cache['user.me']);
//        return cache['user.me'] = api.get( '/api/user/me')
//          .then(function(result) {
//            if (!result) throw result;
//            return cache['user.me'] = result;
//          });
//      }
//    }
//
//  };
//
//  sock_init();
//  return api;
//});
