var EventEmitter = require('events'),
    extend       = require('extend');

module.exports = function(options) {
  if ( options.request ) return options.request;

  var request = new EventEmitter();
  extend(request, {
    body   : options.body    || '',
    headers: options.headers || {},
    url    : options.url     || '/'
  });

  return request;
};
