var co = require('co');

module.exports = co(function*() {
  var authService = {
    option: function( req, name ) {
      return req && req.auth && req.auth.user && req.auth.user.options && req.auth.user.options[name];
    }
  };

  return authService;
});
