var path = require('path');

module.exports = {
  docroot: path.join(approot, 'web'),
  port   : parseInt(process.env.PORT || 8080)
};
