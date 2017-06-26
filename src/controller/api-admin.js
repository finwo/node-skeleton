module.exports = {
  'get /api/admin/collections': function*( req, res ) {
    var auth = yield service('auth');
    if ( !auth.option(req, 'admin') ) {
      return res.errorHandler('unauthorized-admin', 403);
    }

    var odm         = yield service('odm'),
        definitions = odm.ds.definitions,
        list        = Object.keys(definitions);
    res.end(list.map(function ( name ) {
      return { name: name };
    }));
  }
};
