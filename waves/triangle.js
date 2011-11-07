floatToSignedInteger = require('../lib/int_encoder');

var kChannels= 2;
var kBytesPerSample= 2;
var kSamplesPerSecond= 44100;
var kStep= kChannels* kBytesPerSample;

module.exports = function(freq) {
  var period = Math.round(kSamplesPerSecond / freq);
  var halfPeriod = Math.floor(period / 2);
  var m = halfPeriod;
  
  return function(t, buffer) {
    var pos = t % period
      , sample;
    if (pos < halfPeriod) {
      sample = 1 - pos * m;
    } else {
      sample = -1 + (pos + halfPeriod) * m; 
    }
    var sample= floatToSignedInteger(sample);
    buffer[t] = buffer[t+2] = sample.lo;
    buffer[t+1] = buffer[t+3] = sample.hi;
  };
};