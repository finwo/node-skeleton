var co        = require('co'),
    Thinodium = require('thinodium');

module.exports = co(function*() {
  return yield Thinodium.connect( config.database.driver.name, config.database.driver.options );
});
