module.exports = function(name, maestro, valueTransform, fun) {
  var lastChange = Date.now();
  return function(value) {
    var now = Date.now();
    if (now - lastChange >= 300) {
      lastChange = now;
      var val = valueTransform(value);
      fun.call(maestro, val);
    }
  }
}