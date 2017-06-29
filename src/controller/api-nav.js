module.exports = {
  'get /api/nav/all': function*( req, res ) {

    var auth = yield service('auth'),
        odm  = yield service('odm'),
        Nav  = yield odm.model('nav');

    Nav.findAll()
      .then(function(list) {
        return list.filter(function(entry) {
          var perms = entry.perms.split(',');
          perms = perms.filter(function(perm) {return !!perm;});
          console.log(entry,perms);
          return true;
        });
      })
      .then(function(list) {
        console.log(list);
        res.end(list);
      });

    //var user = req.auth && req.auth.usr || false;
    //if ( !user ) {
    //  res.writeHeader( 403 );
    //  return res.end(false);
    //}
    //res.end( user );
  }
};
