module.exports = function(name, maestro, valueTransform, fun) {
  var lastValue = 0
    , derivate = 0
    , last;
  return function(value) {
    var now = Date.now();
    lastChange = now;
    var val = valueTransform(value);
    console.log(name, ':', val)
    fun.call(maestro, val);
  }
  
  setInterval(function() {
    derivate = derivate / 2;
  }, 100);
}