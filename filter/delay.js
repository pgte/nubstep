var kSamplesPerSecond= 44100;

module.exports = function(freq) {
  var period;
  var past = []
    , pastPos = 0;
    
  function delayFilter(startT, buf) {
    var t = startT
      , pastTime
      , sample
      , pastSample
      , retBuf = [];

    for(i = 0; i < buf.length; i++) {
      sample = buf[i];
      
      past[pastPos] = sample;
      if (t > period) {
        if (pastSample = past[(t + 1) % period]) {
          // sample = (sample * pastSample);
        }
      }

      retBuf[i] = sample;

      pastPos ++;
      if (pastPos > period) {
        pastPos %= period;
      }
      t ++;
    }
    return retBuf;
  }
  
  delayFilter.freq = function(_freq) {
    console.log('NEW DELAY FREQ:', _freq);
    freq = _freq;
    period = Math.round(kSamplesPerSecond / freq);
  }
  
  delayFilter.freq(freq);
  
  return delayFilter;
};