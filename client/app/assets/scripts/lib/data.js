define(['js-data', 'js-data-http'], function(JSData, DSHttpAdapter) {
  var store   = new JSData.DS(),
      adapter = new DSHttpAdapter({ basePath: '/api' });
  store.registerAdapter('http', adapter, {default:true});
  return {
    User: store.defineResource('user')
  };
});
