module.exports = {
  "get /": function*( req, res ) {
    res.writeHeader(302, {
      'Location': '/' + req.language + '/'
    });
    res.end();
  }
};
