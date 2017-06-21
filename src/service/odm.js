var co     = require('co'),
    extend = require('extend'),
    JSData = require('js-data');

module.exports = co(function*() {
  var odm, store       = new JSData.DS(),
      adapterName      = config.database.adapter.name,
      adapterConstruct = require('js-data-' + adapterName),
      adapter          = new adapterConstruct(config.database.adapter.options);
  store.registerAdapter(config.database.adapter.name, adapter, { default: true });

  return odm = {
    model: function ( name ) {
      return co(function*() {
        if ( store.definitions[ name ] ) return store.definitions[ name ];
        var options = { name: name, table: name };
        extend(options, config.database.collections[ name ] || {});
        if ( adapterName == 'mongodb' ) options.idAttribute = '_id';
        return store.defineResource(options);
      });
    }
  };
});
