var EventEmitter = require('events'),
    extend       = require('extend'),
    isBuffer     = require('is-buffer');

module.exports = function(options) {
  if ( options.response ) return options.response;
  var response  = new EventEmitter(),
      websocket = options.websocket || false;

  function end() {
    if ( !websocket ) throw "Not Supported";
    var data = response;
    delete data._events;
    delete data._eventsCount;
    delete data.domain;
    Object.keys(data).forEach(function(key) {
      if ( 'function' == typeof data[key] ) delete data[key];
    });
    websocket.write(JSON.stringify(data));
  }

  extend(response, {
    _id        : options._id || null,
    body       : '',
    data       : [],
    end        : function ( input ) {
      if ( input ) response.write(input);
      response.finished = true;
      response.emit('end');
    },
    finished   : false,
    headers    : options.headers || {},
    status     : 200,
    write      : function ( input ) {
      if ( isBuffer(input) ) input = input.toString();
      if ( 'string' == typeof input ) return response.body += input;
      response.data.push(input);
    },
    writeHeader: function ( status, headers ) {
      response.status = status;
      extend(response.headers, headers);
    }
  });

  // Attach to events
  response.on('end', end);

  return response;

  //EventEmitter.call(this);
  //console.log(this);
  //console.log(this.prototype);
  //process.exit(0);
  //var self      = this,
  //    websocket = options.websocket || false;
  //
  //var statusMessages = {
  //  '200': 'OK',
  //  '400': 'Bad Request',
  //  '403': 'Permission Denied',
  //  '404': 'Not Found',
  //  '500': 'Internal Error'
  //};
  //
  //// Internal functions
  //function end() {
  //  if ( websocket ) {
  //    var data = {
  //      _id: self._id,
  //
  //    }
  //  } else {
  //    throw "Not Implemented";
  //  }
  //}
}
;
