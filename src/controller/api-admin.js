module.exports = {
  'get /api/admin/views': function*( req, res ) {
    var auth = yield service('auth');
    if ( !auth.option(req, 'admin') ) {
      return res.errorHandler('unauthorized-admin', 403);
    }

    var odm         = yield service('odm'),
        definitions = odm.ds.definitions,
        list        = Object.keys(definitions);

    if ( req.params.q ) {
      list = list.filter(function ( name ) {
        return name.indexOf(req.params.q) >= 0;
      });
    }

    res.end(
      [ { name: 'blank' } ].concat(list.map(function ( name ) {
        return { name: name };
      }))
    );
  },

  'get /api/admin/user/search': function*( req, res ) {
    var auth        = yield service('auth'),
        userService = yield service('UserService');
    if ( !auth.option(req, 'admin') ) {
      return res.errorHandler('unauthorized-admin', 403);
    }
    return userService
      .search(req.params && req.params.q || '')
      .then(res.end);
  }
};
