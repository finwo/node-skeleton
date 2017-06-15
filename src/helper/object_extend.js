var extend = require('extend');

Object.prototype.extend = function( data ) {
  extend(this,data);
};
