module.exports = {
  "any *": function*( req, res ) {
    var requested = (req.headers[ 'accept-language' ] || '').split(',');
    requested.push(config.language.default);
    req.language = requested
      .map(function ( language ) {
        return language.split(';').shift();
      })
      .intersect(Object.keys(config.language))
      .shift();
  }
};
