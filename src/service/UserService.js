var co = require('co');

module.exports = co(function*() {
  var odm   = yield service('odm'),
      User  = yield odm.model('user'),
      token = yield service('token'),
      cache = {};

  var UserService = {

    encryptPassword: function ( password ) {
      return co(function*() {
        return '#' + ( yield token.generate(password) );
      });
    },

    checkPassword: function ( user, password ) {
      return co(function*() {
        // Transform username to user
        if ( 'string' == typeof user ) {
          user = yield UserService.get(user);
        }
        // Check we have all requirements
        if ( !user || !user.password || !password ) {
          throw 'userservice-check-params';
        }
        // Do not allow passing hashes directly
        if ( password.substr(0, 1) == '#' ) {
          return false;
        }
        // Hash it
        return yield token.compare(user.password.substr(1), password);
      });
    },

    get: function( username ) {
      return User
        .findAll({ username: username })
        .then(function(matches) {
          return matches.shift();
        })
    },

    login: function ( data ) {
      if ( !data.username || !data.password ) {
        return Promise.reject("Missing parameters");
      }

      return UserService
        .get(data.username)
        .then(function(user) {
          return co(function*() {
            var result = yield UserService.checkPassword(user, data.password);
            if (result) return user;
            throw "userservice-login-none";
          });
        })
        .then(function(user) {
          delete user.password;
          return token.generate({
            usr : user,
            iat : Math.floor((new Date()).getTime() / 1000),
            exp : Math.floor((new Date()).getTime() / 1000) + config.http.session.expires
          });
        });
    },

    search: function ( username ) {
      return co(function*() {
        // Check we have all requirements
        if ( !username ) {
          throw 'userservice-search-params';
        }
        return User
          .findAll({
            where: {
              username: {
                'contains': username
              }
            },
            limit: 10
          })
          .then(function ( result ) {
            return result.map(function ( user ) {
              delete user.password;
              return user;
            });
          })
      });
    }
  };

  return UserService;
});
