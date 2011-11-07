floatToSignedInteger = require('../lib/int_encoder');

var kChannels= 2;
var kBytesPerSample= 2;
var kSamplesPerSecond= 44100;
var kStep= kChannels* kBytesPerSample;

module.exports = function(freq) {
  return function(t, buffer) {
    var α= (freq * 2 * Math.PI * t / kSamplesPerSecond / kStep) % (2* Math.PI);
    var sample= floatToSignedInteger(Math.sin(α));
    //process.stdout.write([i/step, α, sample.v, sample.hi, sample.lo] + "\r\n");
    buffer[t] = buffer[t+2] = sample.lo;
    buffer[t+1] = buffer[t+3] = sample.hi;
  };
};