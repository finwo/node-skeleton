module.exports = {
  'post /api/user/login': function* (req, res) {
    var UserService = yield service('UserService');

    UserService
      .login(req.params)
      .then(res.end, res.errorHandler)
  }
};
