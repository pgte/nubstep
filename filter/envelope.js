var kSamplesPerSecond= 44100;

module.exports = function(freq) {
  function envelopeFilter(startT, buf) {
    var thisFreq = freq
      , i, α, amp
      , t = startT
      , retBuf = [];
    for(i = 0; i < buf.length; i++) {
      α = (thisFreq * 2 * Math.PI * t / kSamplesPerSecond);
      // console.log('α', α);
      amp = (Math.sin(α) + 1) / 2;
      // console.log('amp:', amp);
      retBuf.push(amp * buf[i]);
      t ++;
    }
    return retBuf;
  }
  
  envelopeFilter.freq = function(_freq) {
    console.log('NEW ENVELOPE FREQ:', _freq);
    freq = _freq;
  }
  
  return envelopeFilter;
};