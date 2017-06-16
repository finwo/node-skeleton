var co = require('co');

module.exports = co(function*() {
  var odm   = yield service('odm'),
      model = yield odm.model('User', config.database.collections.User );

  return model;
});
