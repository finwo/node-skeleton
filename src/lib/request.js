var EventEmitter = require('events'),
    extend       = require('extend');

module.exports = function(options) {
  var request = options.request || new EventEmitter(),
      cookie  = false;

  extend(request, {
    body   : request.body || options.body || '',
    headers: request.headers || options.headers || {},
    method : request.method || options.method || {},
    url    : request.url || options.url || '/'
  });

  request.getCookie = function(key) {
    if ( !cookie ) {
      cookie = {};
      ( request.headers && request.headers.cookie || '' )
        .split('; ')
        .map(function(token) { return token.split('=', 2); })
        .map(function(token) { return { key: token.shift(), value: token.shift() }; })
        .map(function(token) { try { return {key: token.key, value: JSON.parse(token.value)}; } catch(e) {return token;} })
        .forEach(function(token) {
          set_deep( cookie, token.key, token.value );
        });
    }
    return cookie[key];
  };

  return request;
};
