define([ 'query', 'events', 'sockjs', 'bluebird', 'uid', 'rivets' ], function ( query, EventEmitter, SockJS, Promise, uid, rivets ) {

  // Helper functions
  function getCookie( name ) {
    var data = query.decode(document.cookie, '; ');
    return data[ name ] || undefined;
  }

  // SockJS connection
  var sock = false;
  function sock_init() {
    var sockurl = window.location.protocol + '//' + window.location.hostname;
    if ( window.location.port.length ) sockurl += ':' + window.location.port;
    sockurl += '/socket';
    if ( sock ) return;
    sock           = new SockJS(sockurl);
    sock.onopen    = function () {
      api.emit('connect');
    };
    sock.onclose   = function () {
      sock = false;
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
      loading   = {},
      api       = EventEmitter.mixin({
        bubble: true,

        // Raw call
        raw: function ( data ) {
          data._id            = uid();
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
                reject((data && data.body) || (data && data.data) || data);
              } else {
                resolve((data && data.body) || (data && data.data) || data);
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
          return api.routed(url, options);
        },

        // NAV model
        nav: EventEmitter.mixin({
          data: {},
          all : function () {
            if ( !loading['nav.all'] ) {
              loading['nav.all'] = api
                .get('/api/nav/all')
                .then(function ( data ) {
                  api.nav.data.all   = data;
                  api.nav.emit('data:all', data);
                  loading['nav.all'] = false;
                  return data;
                })
            }
            return loading['nav.all'];
          }
        }),

        // USER model
        user: EventEmitter.mixin({
          data: {},
          isLoggedIn: function() {
            var cookie = getCookie('auth'),
                result = !!(cookie && cookie.length || false);
            api.user.emit('data:isLoggedIn', result);
            api.user.data.isLoggedIn = result;
            return Promise.resolve(result);
          },
          me  : function () {
            if ( !loading['user.me'] ) {
              loading['user.me'] = api
                .get('/api/user/me')
                .then(function ( data ) {
                  api.user.data.me   = data;
                  api.user.emit('data:me', data);
                  loading['user.me'] = false;
                  return data;
                })
            }
            return loading['user.me'];
          },
          login: function(data) {
            return api.post( '/api/user/login', { data: data })
              .then(function( token ) {
                if (Array.isArray(token)) token = token.shift();
                if ( token ) {
                  api.emit('login', token);
                  return token;
                }
                throw "login-failed";
              });
          },
          logout: function() {
            return new Promise(function(resolve) {
              api.emit('logout');
              resolve(true);
            });
          },
        })
      });

  // Track states
  api.on('connect', api.emit.bind(api, 'queue'));
  api.on('logout', function () {
    loading         = {};
    api.nav.data    = {};
    api.user.data   = {};
    document.cookie = 'auth=; path=/';
    api.nav.emit('data:all');
    api.user.emit('data:me');
  });
  api.on('login', function ( token ) {
    loading         = {};
    api.nav.data    = {};
    api.user.data   = {};
    document.cookie = 'auth=' + token + '; path=/';
    api.nav.emit('data:all');
    api.user.emit('data:me');
  });

  // Bubble events to the server
  api.on('*', function ( name ) {
    if ( [ 'connect', 'disconnect', 'queue', 'login', 'logout' ].indexOf(name) >= 0 ) return;
    if ( !this.bubble ) return;
    var data = arguments;
    data     = Object.keys(data).map(function ( key ) {return data[ key ];});
    data.shift();
    api.raw({ type: 'event', name: name, data: data })
  });

  // Handle outbox & connect if needed
  api.on('queue', function () {
    if ( !sock ) return setTimeout(sock_init, 100);
    if ( sock.readyState !== SockJS.OPEN ) return setTimeout(api.emit.bind(api, 'queue'), 100);
    var msg = outbox.shift();
    if ( !msg ) return;
    sock.send(msg);
    if ( outbox.length ) setTimeout(api.emit.bind(api, 'queue'), 5);
  });

  // Tell rivets how to use our api
  rivets.adapters[ ':' ] = {
    observe  : function ( obj, keypath, callback ) {
      obj.on('data:' + keypath, callback);
    },
    unobserve: function ( obj, keypath, callback ) {
      obj.off('data:' + keypath, callback);
    },
    get      : function ( obj, keypath ) {
      if ( !obj.data[ keypath ] ) {
        obj[ keypath ]();
      }
      return obj.data[ keypath ];
    },
    set      : function ( obj, keypath, value ) {
      obj.data[ keypath ] = value;
      obj.emit('data:' + keypath, value);
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
//    }
//
//  };
//
//  sock_init();
//  return api;
//});
