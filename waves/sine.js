var kSamplesPerSecond= 44100;

module.exports = function(freq) {
  return function(t) {
    var α= (freq * 2 * Math.PI * t / kSamplesPerSecond);
    return Math.sin(α);
  };
};