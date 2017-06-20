module.exports = {
  "any *": function*( req, res ) {

    // Unauthorized request
    req.auth = {};

    // Fetch auth cookie
    var auth = req.getCookie('auth') || false;
    if (!auth) return;

    // Validate the cookie
    var token   = yield service('token'),
        decoded = yield token.decode( auth );

    // Invalid => not authenticated
    if (!decoded) return;

    // Check timings
    decoded.exp = decoded.exp || 0;
    var now     = Math.floor((new Date()).getTime()/1000),
        expired = now > decoded.exp,
        refresh = ( now + config.http.session.expires ) > decoded;

    // Expired => not authenticated
    if ( expired ) return;

    // Being here => authenticated
    req.auth = decoded;

    // Check if we need to refresh the token
    if ( !refresh ) return;
    decoded.exp = Math.floor((new Date()).getTime()/1000) + config.http.session.expires;
    res.setCookie('auth', yield token.generate( decoded ));
  }
};
