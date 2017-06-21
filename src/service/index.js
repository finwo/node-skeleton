var ser = {};

global.service = function(name) {
  return ser[name] = ser[name] || require('./'+name);
};
global.service.register = function( name, obj ) {
  ser[name] = ser[name] || obj;
};
