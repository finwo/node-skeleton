module.exports = {
  "get *": function*( req, res ) {
    if ( !config.http.cache.enabled ) return;
    var isDynamic = false;
    config.http.cache.dynamic.forEach(function(start) {
      if ( req.url.substr(0,start.length) == start ) isDynamic = true;
    });
    if ( isDynamic ) return;
    var date    = new Date(),
        expires = new Date(date.getTime() + (config.http.cache.ttl * 1000));
    res.setHeader('date'   , date    );
    res.setHeader('expires', expires );
  }
};
