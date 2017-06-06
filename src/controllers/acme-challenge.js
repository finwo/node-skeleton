module.exports = {
  'get /.well-known/acme-challenge/:payload': function* (req, res) {
    res.writeHeader(200, {
      'Content-Type': 'text/plain'
    });
    res.end(req.params.payload);
  }
};
