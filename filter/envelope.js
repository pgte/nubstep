var kSamplesPerSecond= 44100;

module.exports = function(freq) {
  function envelopeFilter(startT, buf) {
    var i, α, period
      , t = startT
      , retBuf = [];

    for(i = 0; i < buf.length; i++) {
      α = (freq * 2 * Math.PI * t / kSamplesPerSecond) % (2* Math.PI);
      period = (Math.sin(α) + 1) / 2;
      retBuf.push(period * buf[i]);
      t ++;
    }
    return retBuf;
  }
  
  envelopeFilter.freq = function(_freq) {
    freq = _freq;
  }
  
  return envelopeFilter;
};