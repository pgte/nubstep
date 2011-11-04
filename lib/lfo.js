var SAMPLE_PRECISION = 2;

var waveTypes = {
    'sine' : require('../waves/sine')
};

function waveGenerator(freq, type) {
  return waveTypes [type] (freq);
}

module.exports = function(options) {
  var t
    , bufferPos
    , sample
    , baite;
  
  var duration = options.duration;
  var freq = options.freq;
  
  var buf = new Buffer(duration * SAMPLE_PRECISION * 2);
  console.log('buffer.length:', buf.length);
  var gen = waveGenerator(freq, 'sine');

  for(t = 0; t < buf.length; t += 4) {
    gen(t, buf);
  }

  return buf;
  
};