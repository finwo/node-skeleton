var co     = require('co');

module.exports = co(function*() {
  var odm    = yield service('odm'),
      User   = yield odm.model('user'),
      token  = yield service('token');

  var userService = {

    encryptPassword: function( password ) {
      return co(function*() {
        return '#' + ( yield token.generate(password) );
      });
    },

    checkPassword: function( user, password ) {
      return co(function*() {
        // Check we have all requirements
        if ( !user || !user.password || !password ) {
          throw 'userservice-check-params';
        }
        // Do not allow passing hashes directly
        if ( password.substr(0, 1) == '#' ) {
          return false;
        }
        // Hash it
        return yield token.compare( user.password.substr(1), password );
      });
    },

    login: function(data) {
      if ( !data.username || !data.password ) {
        return Promise.reject("Missing parameters");
      }

      return User
        .findAll({ username: data.username })
        .then(function( matches ) {
          return co(function*() {
            var match, result;
            while( match = matches.shift() ) {
              result = yield userService.checkPassword( match, data.password );
              if ( result ) {
                return match;
              }
            }
            throw "userservice-login-none";
          });
        })
        .then(function(user) {
          delete user.password;
          return token.generate({
            user: user,
            iat : Math.floor((new Date()).getTime() / 1000),
            exp : Math.floor((new Date()).getTime() / 1000) + config.http.session.expires
          });
        })
    }
  };

  return userService;
});
