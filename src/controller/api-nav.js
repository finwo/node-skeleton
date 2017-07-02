module.exports = {
  'get /api/nav/all': function*( req, res ) {

    var auth = yield service('auth'),
        odm  = yield service('odm'),
        Nav  = yield odm.model('nav');

    Nav.findAll()
      .then(function(list) {
        return list.filter(function(entry) {
          var perms = entry.perms.split(',');
          perms = perms
            .filter(function(perm) {return !!perm;})
            .filter(auth.optionFilter(req));
          return !perms.length;
        });
      })
      .then(res.end);

    //var user = req.auth && req.auth.usr || false;
    //if ( !user ) {
    //  res.writeHeader( 403 );
    //  return res.end(false);
    //}
    //res.end( user );
  }
};
