var floatToSignedInteger = require('./int_encoder');

var kChannels= 2;
var kBytesPerSample= 2;

module.exports = function(inBuf) {
  var outBuf
    , sample
    , bufferPos;
  
  outBuf = new Buffer(inBuf.length * kChannels * kBytesPerSample);
  
  for(var t = 0; t < inBuf.length; t ++) {
    bufferPos = t * kChannels * kBytesPerSample;
    sample = floatToSignedInteger(inBuf[t]);
    outBuf[bufferPos] = outBuf[bufferPos + 2] = sample.lo;
    outBuf[bufferPos + 1] = outBuf[bufferPos + 3] = sample.hi;
  }
  
  return outBuf;
  
}