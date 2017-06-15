define(['sockjs', 'uid'], function(SockJS, uid) {
  var uri = window.location.protocol + '//' + window.location.hostname;
  if ( window.location.port.length ) uri += ':' + window.location.port;
  uri += '/socket';
  var sock = new SockJS(uri);

  console.log(sock);

  return {};
});
