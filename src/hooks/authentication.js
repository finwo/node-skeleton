var Q = require('q');

// Cookie: auth
// encrypt({
//   data: username + '|' + expires
//   key:  domain + md5 ( password )
// })

module.exports = function (req, res) {
  return Q.fcall(function(){return true})
    .then(function() {
      var cookie = req.headers.cookie || '';
      req.user = cookie;
    });
};
