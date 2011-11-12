module.exports = function(name, maestro, valueTransform, fun) {
  var lastValue = 0
    , derivate = 0
    , lastChange = Date.now();

  function valueChanged(value) {
    var now = Date.now();
    var sinceLast = now - lastChange;
    var val = valueTransform(value);
    console.log('NEW VALUE FOR', name, ':', val);
    derivate = (value - lastValue) / sinceLast;
    lastValue = value;
    lastChange = now;
    fun.call(maestro, val);
  }
  
  setInterval(function() {
    derivate = derivate * 0.99999;
    console.log("derivate for", name, ':', derivate);
    if (derivate > 0.001) {
      fun.call(maestro, lastValue + lastValue * derivate);
    }
  }, 200);
  
  return valueChanged;
}