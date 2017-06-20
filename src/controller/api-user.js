module.exports = {
  'post /api/user/login': function*( req, res ) {
    var UserService = yield service('UserService');
    UserService
      .login(req.params)
      .then(res.end, res.errorHandler)
  },

  'get /api/user/me': function*( req, res ) {
    var user = req.auth && req.auth.user || false;
    if ( !user ) {
      res.writeHeader( 403 );
      return res.end({

      });
    }
    res.end( req.auth && req.auth.user || {
        stat
      });
    res.end({foo:'bar'});
  }
};
