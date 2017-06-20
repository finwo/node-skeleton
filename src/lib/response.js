var EventEmitter = require('events'),
    extend       = require('extend'),
    isBuffer     = require('is-buffer');

module.exports = function(options) {
  var response  = options.response || new EventEmitter(),
      websocket = options.websocket || false,
      cookie    = {};

  function end() {
    if ( options.response ) return true;
    if ( !websocket ) throw "Not Supported";
    response.finished = true;
    delete response._events;
    delete response._eventsCount;
    delete response.domain;
    Object.keys(response).forEach(function(key) {
      if ( 'function' == typeof response[key] ) delete response[key];
    });
    if ( response.data.length == 1 ) {
      response.data = response.data.shift();
    }
    websocket.write(JSON.stringify(response));
  }

  // Variables
  extend(response, {
    _id     : response._id || options._id || null,
    body    : response.body || '',
    error   : response.error || false,
    data    : response.data || [],
    finished: response.finished || false,
    headers : response.headers || options.headers || {},
    status  : response.status || options.status || 200
  });

  // Methods
  extend(response, {
    errorHandler: response.errorHandler || function ( err ) {
      response.status = 500;
      response.error  = {
        title      : err,
        description: err + '-body'
      };
      response.end();
    },
    end         : response.end || function ( input ) {
      if ( input ) response.write(input);
      response.emit('end');
    },
    write       : response.write || function ( input ) {
      if ( isBuffer(input) ) input = input.toString();
      if ( 'string' == typeof input ) return response.body += input;
      response.data.push(input);
    },
    writeHeader : response.writeHeader || function ( status, headers ) {
      response.status = status;
      headers = headers || {};
      extend(response.headers, headers);
    },
    setHeader   : response.setHeader || function ( key, value ) {
      response.headers[ key ] = value;
    },
    setCookie: function(key, value) {
      if ( !cookie ) {
        response.getHeader('set-cookie')
          .split('; ')
          .map(function(token) { return token.split('=', 2); })
          .map(function(token) { return { key: token.shift(), value: token.shift() }; })
          .map(function(token) { try { return {key: token.key, value: JSON.parse(token.value)}; } catch(e) {return token;} })
          .forEach(function(token) {
            set_deep( cookie, token.key, token.value );
          });
      }
      cookie[key] = value;
      response.setHeader('set-cookie', Object.keys(cookie).map(function(key) { return key + '=' + cookie[key]; }).join('; '));
    }
  });

  // Attach to events
  response.on('end', end);
  return response;
}
;
