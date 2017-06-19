var co     = require('co'),
    crypto = require('crypto-js');

module.exports = co(function*() {
  var secret = config.secrets.crypto || 'ChangeMe';
  var tokenService = {
    generate: function(data) {
      if (Array.isArray(data)) return data.map(tokenService.generate);
      return co(function*() {
        if ( data.then ) data = yield data;
        if ('string' != typeof data) data = JSON.stringify(data);
        return crypto.AES.encrypt( data, secret ).toString();
      });
    },
    decode: function( token ) {
      if (Array.isArray(token)) return token.map(tokenService.decode);
      return co(function*() {
        if ( token.then ) token = yield token;
        try {
          var decrypted = crypto.AES.decrypt( token, secret ).toString(crypto.enc.Utf8);
        } catch(e) {
          return false;
        }
        try {
          return JSON.parse(decrypted);
        } catch(e) {
          return decrypted;
        }
      });
    }
  };
  return tokenService;
});
