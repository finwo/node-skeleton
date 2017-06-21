var co = require('co');

/* These are only predefined collections
 * The project is set up to allow run-time collections
 */

module.exports = require('co')(function*() {
  return {
    document: {
    },

    rule: {

    },

    user: {
      beforeCreate: function( resource, data, cb ) {
        return co(function*() {
          if ( !data.password ) throw "Missing password";
          if ( 'string' != typeof data.password ) throw "Password not a string";

          if ( data.password.substr(0,1) != '#' ) {
            var UserService = yield service('UserService');
            data.password = yield UserService.encryptPassword(data.password);
          }

          return data;
        });
      }
    }

  };
});
