var co  = require('co'),
    jwt = require('jsonwebtoken');

module.exports = co(function*() {
  var secret = config.secrets.jwt || 'ChangeMe';

  return {
    secret: function(newSecret) {
      return Promise.resolve( secret = newSecret );
    },
    sign: function( data ) {
      return new Promise(function(resolve, reject) {
        jwt.sign(data, secret, function(err, token) {
          if ( err ) return reject(err);
          resolve(token);
        });
      });
    },
    verify: function( token ) {
      return new Promise(function(resolve, reject) {
        jwt.verify(token, secret, function(err, decoded) {
          if ( err ) return reject(err);
          resolve(decoded);
        });
      });
    }
  };
});
