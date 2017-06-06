Array.prototype.intersect = function( matches ) {
  return this.filter(function( entry ) {
    return matches.indexOf(entry) !== -1;
  });
}