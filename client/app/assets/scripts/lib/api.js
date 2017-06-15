define(['sockjs', 'uid'], function(SockJS, uid) {

  // Settings
  var uri = window.location.protocol + '//' + window.location.hostname;
  if ( window.location.port.length ) uri += ':' + window.location.port;
  uri += '/socket';

  // Initialize
  var sock = new SockJS(uri);
  sock.onopen  = function() { console.log('Connected'); };
  sock.onclose = function() { console.log('Disconnected'); };

  // Message receiver
  sock.onmessage = function(e) {
    var raw = e.data.split(' ', 2),
        id  = raw.shift();

    console.log('message', e.data);
    sock.close();
  };

  // Keep track of callbacks
  var callbacks = [];

  // The actual API
  var api = {
    raw: function(data) {
      var id = uid();
      if (!Array.isArray(data)) data = [data];
      sock.send(id + ' ' + JSON.stringify(data));
      return id;
    },
  };

  return api;
});
