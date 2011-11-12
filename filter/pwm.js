var kSamplesPerSecond= 44100;

module.exports = function(freq, pw) {
  var period;
  function envelopeFilter(startT, buf) {
    var thisFreq = freq
      , i, α, sin, sample
      , t = startT
      , retBuf = [];
      
    for(i = 0; i < buf.length; i++) {
      var pos = t % period
        , sample;
      
      if (pos <= period * pw) {
        sample = buf[i];
      } else {
        sample = 0; 
      }
      
      retBuf.push(sample);
      t ++;
    }
    return retBuf;
  }
  
  envelopeFilter.freq = function(_freq) {
    console.log('NEW PWM FREQ:', _freq);
    freq = _freq;
    period = Math.round(kSamplesPerSecond / freq);
  }

  envelopeFilter.pulseWidth = function(_pw) {
    console.log('NEW PWM WIDTH:', _pw);
    pw = _pw;
  }

  envelopeFilter.freq(freq);
  
  return envelopeFilter;
};