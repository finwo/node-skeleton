module.exports = {
  "get /test": function* ( req, res ) {
    res.end('IT WORKS');
    console.log(req);
  },
  "get /collection/:name": function* ( req, res ) {
    res.end('Check your console.log');
    console.log(req.params);
  }
};
