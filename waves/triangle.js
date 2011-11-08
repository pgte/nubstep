var kSamplesPerSecond= 44100;

module.exports = function(freq) {
  var period = Math.round(kSamplesPerSecond / freq);
  var halfPeriod = Math.floor(period / 2);
  var m = halfPeriod;
  
  return function(t) {
    var pos = t % period
      , sample;
    if (pos < halfPeriod) {
      sample = 1 - pos / m;
    } else {
      sample = -1 + (pos + halfPeriod) / m; 
    }
    return sample;
  };
};