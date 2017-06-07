var Q = require('q');

module.exports = function ( req, res ) {
  return Q.fcall(Q.async(function*() {
    var router = yield service('router');
    req.cookie = router.getCookie(req);
  }));
};
