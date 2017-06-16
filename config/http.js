var co   = require('co'),
    path = require('path');

/**
 * Pad & cut a string to the given length
 *
 * @param {string} subject
 * @param {number} length
 * @param {string} padding
 * @return {string}
 */
function lpad( subject, length, padding ) {
  padding = padding || ' ';
  while ( subject.length < length ) subject = padding + subject;
  return subject.substr(-length);
}

function explodeDate(src) {
  return {
    'date'        : '' + src,
    'day'         : lpad('' + src.getUTCDate(), 2, '0'),
    'hour'        : lpad('' + src.getUTCHours(), 2, '0'),
    'minute'      : lpad('' + src.getUTCMinutes(), 2, '0'),
    'milliseconds': lpad('' + src.getUTCMilliseconds(), 3, '0'),
    'month'       : lpad('' + (src.getUTCMonth() + 1), 2, '0'),
    'seconds'     : lpad('' + src.getUTCSeconds(), 2, '0'),
    'year'        : lpad('' + src.getUTCFullYear(), 4, '0'),
  };
}

module.exports = co(function*() {
  var http = {

    // Static
    default_home: [ 'index.html', 'index.htm' ],
    static_route: path.join(approot, 'web'),

    // HTTP
    port         : parseInt(process.env.PORT || 3000),
    served_by    : 'TrackThis',
    software_name: require(path.join(approot, 'package.json')).name,
    version      : require(path.join(approot, 'package.json')).version,

    // Logging
    log: function() {
      var args         = arguments,
          dateTemplate = '[' + '{year}-{month}-{day} {hour}:{minute}:{seconds}.{milliseconds} Z'.gray + ']',
          data         = explodeDate(new Date());
      args = Object.keys(args).map(function(key) {
        return args[key];
      });
      var severity = args.shift();
      return console.log.apply(console, [ dateTemplate.format(data), severity.cyan ].concat(Object.keys(args).map(function ( key ) {
        return args[ key ];
      })));
    },

    // WebSocket
    ws: {
      log       : function(){},
      prefix    : '/socket',
      sockjs_url: '/assets/bower/sockjs-client/dist/sockjs.min.js'
    },

    // Cache
    cache: {
      enabled   : true,
      extensions: [ 'js', 'css' ],
      ttl       : 3600
    },

    // Other settings
    globalAgent  : {
      maxSockets: 20
    },
    mimetypes : {
      'css' : 'text/css',
      'htm' : 'text/html',
      'html': 'text/html',
      'js'  : 'text/javascript',
      'svg' : 'image/svg+xml'
    }

  };

  http.ws.log = http.log;
  return http;
});
