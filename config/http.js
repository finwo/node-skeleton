var co   = require('co'),
    path = require('path');

module.exports = co(function*() {
  return {

    // Static
    default_home: [ 'index.html', 'index.htm' ],
    static_route: path.join(approot, 'web'),

    // HTTP
    port         : parseInt(process.env.PORT || 3000),
    served_by    : 'TrackThis',
    software_name: require(path.join(approot, 'package.json')).name,
    version      : require(path.join(approot, 'package.json')).version,

    // Logging
    log: {
      handler : console.log,
      template: '[ {year}-{month}-{day} {hour}:{minute}:{seconds}.{milliseconds} Z ] {method} {path}'
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
      'js'  : 'text/javascript'
    }

  };
});
