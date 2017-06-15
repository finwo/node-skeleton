module.exports = {
  "get *": function*( req, res ) {
    if ( !config.http.cache.enabled ) return;
    var ext = req.url.split('?').shift().split('.').pop();
    if ( config.http.cache.extensions.indexOf(ext) < 0 ) return;
    var date    = new Date(),
        expires = new Date(date.getTime() + (config.http.cache.ttl * 1000));
    res.setHeader('date'   , date    );
    res.setHeader('expires', expires );
  }
};
