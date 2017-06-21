var co = require('co');

/* These are just collection settings, like hooks
 */

module.exports = require('co')(function*() {
  return {
    'user'       : {
      beforeCreate: function ( resource, data, cb ) {
        return co(function*() {
          if ( !data.password ) throw "Missing password";
          if ( 'string' != typeof data.password ) throw "Password not a string";

          if ( data.password.substr(0, 1) != '#' ) {
            var UserService = yield service('UserService');
            data.password   = yield UserService.encryptPassword(data.password);
          }

          return data;
        });
      }
    }
  };
});
