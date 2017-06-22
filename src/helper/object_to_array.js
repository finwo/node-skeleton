global.object_to_array = function(obj) {
  return Object.keys(obj).map(function(key) {
    return obj[key];
  });
};
