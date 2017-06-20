var co     = require('co');

module.exports = co(function*() {
  var odm    = yield service('odm'),
      User   = yield odm.model('User', config.database.collections.User ),
      filter = yield service('EntityFilter'),
      token  = yield service('token');

  var userService = {

    checkPassword: function( user, password ) {
      return co(function*() {
        if ( !user || !password ) {
          throw 'userservice-check-params';
        }
        if ( !user.password ) {
          return false;
        }
        if ( password.substr(0,1) != '#' ) {
          password = '#' + ( yield token.generate(password) );
        }
        if ( user.password.substr(0,1) != '#' ) {
          user.password = '#' + ( yield token.generate(user.password) );
        }
        return user.password == password;
      });
    },

    login: function(data) {
      if ( !data.username || !data.password ) {
        return Promise.reject("Missing parameters");
      }

      return User
        .getAll()
        .then(filter({ username: data.username }))
        .then(function( matches ) {
          matches = matches.filter(function(user) {
            return userService.checkPassword(user, data.password);
          });
          if ( matches.length < 1 ) throw "userservice-login-none";
          if ( matches.length > 1 ) throw "userservice-login-multiple";
          return matches.shift();
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
