module.exports = {
  "any *": function*( req, res ) {

    // First notify we're not logged in
    req.user = false;

    // Fetch cookie header
    var headers = req.headers || {},
        cookie  = headers.cookie || '';

    // Fetch auth from cookie
    var auth = cookie
      .split('; ')
      .map(function(token) { return token.split('='); })
      .map(function(token) { return { key: token.shift(), value: token.shift() }; })
      .filter(function(token) { return token.key == 'auth'; })
      .map(function(token) { try { return JSON.parse(token.value); } catch(e) { return token.value; } })
      .shift() || false;

    // Make sure we have it
    if (!auth) return;

    // Validate it
    var token   = yield service('token'),
        decoded = yield token.decode( auth );
    if (!decoded) return;

    // Decoding = logged in
    req.user = decoded;

  }
};
