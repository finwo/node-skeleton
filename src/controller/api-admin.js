module.exports = {
  'get /api/admin/collections': function*( req, res ) {
    var auth = yield service('auth');
    if ( !auth.option(req, 'admin') ) {
      return res.errorHandler('unauthorized-admin', 403);
    }

    var odm         = yield service('odm'),
        definitions = odm.ds.definitions,
        list        = Object.keys(definitions);

    if ( req.params.q ) {
      list = list.filter(function(name) {
        return name.indexOf(req.params.q) >= 0;
      });
    }

    res.end(list);
  }
};
