module.exports = function(name, maestro, valueTransform, fun) {
  return function(value) {
    fun.call(maestro, valueTransform(value));
  }
}