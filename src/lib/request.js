var EventEmitter = require('events'),
    extend       = require('extend');

module.exports = function(options) {
  if ( options.request ) return options.request;

  var request = new EventEmitter();
  extend(request, {
    headers: options.headers || {},
    url    : options.url     || '/'
  });
  //var websocket = options.websocket || false,
  //    request   = {
  //
  //    };

  return request;

  //this.method  = (options.method || 'get').toUpperCase();
  //this.url     = (options.url    || '/'  ).toUpperCase();
  //this.headers = options.headers || {};
};
