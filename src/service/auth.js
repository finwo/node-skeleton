var co = require('co');

module.exports = co(function*() {
  var authService = {
    option: function( req, name ) {
      return req && req.auth && req.auth.usr && req.auth.usr.options && req.auth.usr.options[name];
    }
  };

  return authService;
});
