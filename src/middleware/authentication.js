module.exports = {
  "any *": function*( req, res ) {

    // Unauthorized request
    req.user = false;

    // Fetch auth cookie
    var auth = req.getCookie('auth') || false;
    if (!auth) return;

    // Validate the cookie
    var token   = yield service('token'),
        decoded = yield token.decode( auth );
    if (!decoded) return;

    // Check if it hasn't expired
    var expired = Math.floor((new Date()).getTime()/1000) > (decoded.exp||0);
    if ( expired ) return;

    // Decoding = logged in
    req.user = decoded;

    // Refresh token to stay logged in
    decoded.exp = Math.floor((new Date()).getTime()/1000) + config.http.session.expires;
    res.setCookie('auth', yield token.generate( decoded ));
  }
};
