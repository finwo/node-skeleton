module.exports = {
  'get /api/admin/views': function*( req, res ) {
    var auth = yield service('auth');
    if ( !auth.option(req, 'admin') ) {
      return res.errorHandler('unauthorized-admin', 403);
    }
    res.end('dinges');
  },
};
