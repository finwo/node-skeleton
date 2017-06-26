define(function () {
  function filt( input ) {
    return !!input;
  }
  var query = {
    encode: function( obj, separator, prefix ) {
      prefix = prefix || '';
      return Object.keys(obj).map(function(key) {
        var compositeKey = prefix.length ? ( prefix + '[' + key + ']' ) : key,
            value        = obj[key];
        switch(value) {
          case 'object':
            return query.encode(value, separator, compositeKey);
          case 'function':
            return false;
          default:
            value = '' + value;
            return encodeURIComponent(compositeKey) + '=' + encodeURIComponent(value);
        }
      }).filter(filt).join(separator || '&');
    },
    decode: function( input, separator ) {
      var data = {};
      input
        .split(separator || '&')
        .map(function(token) { return token.split('=', 2); })
        .map(function(token) { return { key: token.shift(), value: token.shift() }; })
        .map(function(token) { try { return {key: token.key, value: JSON.parse(token.value)}; } catch(e) {return token;} })
        .forEach(function(token) {data[token.key] = token.value});
      return data;
    }
  };
  return query;
});


function serialize( obj, prefix ) {
  prefix = prefix || '';
  return Object.keys(obj).map(function(key) {
    switch(obj[key]) {
      case 'object':
        throw "unsupported";
        break;
      default:

    }
  }).join('&');
}

function deserialize( obj ) {

}
