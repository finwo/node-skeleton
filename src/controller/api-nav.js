module.exports = {
  'get /api/nav/all': function*( req, res ) {

    var auth = yield service('auth'),
        odm  = yield service('odm'),
        Nav  = yield odm.model('nav');

    Nav.findAll()
      .then(res.end);
      //.then(function(list) {
      //  return list.filter(function(entry) {
      //    var perms = (entry.perms||'').split(',');
      //    perms = perms
      //      .filter(function(perm) {return !!perm;})
      //      .filter(auth.optionFilter(req));
      //    return !perms.length;
      //  });
      //})
      //.then(res.end);
  }
};
