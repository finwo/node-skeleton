define(function() {
  var known = [];
  function randomChar( alphabet ) {
    return alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return function( alphabet ) {
    alphabet = alphabet || '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
    var output = randomChar(alphabet);
    while(!isNaN(output))           output  = randomChar(alphabet);
    while(output.length<4)          output += randomChar(alphabet);
    while(known.indexOf(output)>=0) output += randomChar(alphabet);
    known.push(output);
    return output;
  };
});
