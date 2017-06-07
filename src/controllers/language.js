module.exports = {
  "get /": function* (req, res) {
    
    var requested = (req.headers['accept-language'] || '').split(',');
    requested.push(config.languages.default);
    
    requested = requested
      .map(function( language ) {
        return language.split(';').shift();
      })
      .intersect(Object.keys(config.languages))
      .shift();
    
    res.writeHeader(302, {
      'Location': '/'+requested+'/'
    });
    res.end();
  }
};
