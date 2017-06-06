var Thinodium = require('thinodium'),
    Q         = require('q');

module.exports = function () {
  return Thinodium.connect( config.database.driver.name, config.database.driver.options );
};
