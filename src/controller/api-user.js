module.exports = {
  'post /api/user/login': function*( req, res ) {
    var UserService = yield service('UserService');
    UserService
      .login(req.params)
      .then(res.end, res.errorHandler)
  },

  'get /api/user/me': function*( req, res ) {
    var user = req.auth && req.auth.usr || false;
    if ( !user ) {
      return res.end({});
    }
    res.end( user );
  }
};
