var path = require('path');

module.exports = {

  // Static
  default_home : [ 'index.html', 'index.htm' ],
  static_route : path.join(approot, 'web'),

  // HTTP
  port          : parseInt(process.env.PORT || 3000),
  served_by     : 'TrackThis',
  software_name : require(path.join(approot,'package.json')).name,
  version       : require(path.join(approot,'package.json')).version,

  // Cache
  cache: {
    enabled   : true,
    extensions: [ 'js', 'css' ],
    ttl       : 3600
  }

};
