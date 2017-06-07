var Q = require('q');

module.exports = function ( req, res ) {
  return Q.fcall(function () {
    var requested = (req.headers[ 'accept-language' ] || '').split(',');
    requested.push(config.languages.default);
    req.language = requested
      .map(function ( language ) {
        return language.split(';').shift();
      })
      .intersect(Object.keys(config.languages))
      .shift();
  });
};
