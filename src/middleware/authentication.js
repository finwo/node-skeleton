var Q = require('q');

// Cookie: auth
// encrypt({
//   data: username + '|' + expires
//   key:  domain + md5 ( password )
// })

module.exports = function ( req, res ) {
  return Q.fcall(function () {
    // TODO
  });
};
