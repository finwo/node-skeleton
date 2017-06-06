var path = require('path');

module.exports = {

  // Admin credentials
  admin_pwd  : 'admin',
  admin_user : 'admin',

  // Static
  default_home : [ 'index.html', 'index.htm' ],
  list_dir     : false,
  serve_static : true,
  static_route : path.join(approot, 'web'),

  // CGI
  cgi_dir   : "cgi-bin",
  serve_cgi : false,
  serve_php : false,

  // Logging
  log     : console.log,
  logging : true,

  // HTTP
  port          : parseInt(process.env.PORT || 3000),
  served_by     : 'TrackThis',
  software_name : require(path.join(approot,'package.json')).name,
  version       : require('../package.json').version,

  // Sessions
  //avail_nsr_session_handlers: ['dispatch.memory_store', 'dispatch.text_store'],
  use_nsr_session: false,
  nsr_session_handler: 'dispatch.memory_store'

};
