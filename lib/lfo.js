var SAMPLE_PRECISION = 2;

var waveTypes = {
    'sine' : require('../waves/sine')
  , 'triangle' : require('../waves/triangle')
};

function waveGenerator(freq, type) {
  return waveTypes [type] (freq);
}

var memo = {};

module.exports = function(options) {
  var t
    , bufferPos
    , sample
    , baite
    , freqMemo
    , bufferMemo;
  
  if (!options) { options = {}; }
  
  var duration = options.duration;
  var freq = options.freq;
  var wave = options.wave || 'sine';
  
  if (freqMemo = memo[freq]) {
    if (bufferMemo = freqMemo[duration]) {
      return bufferMemo;
    }
  } else {
    freqMemo = memo[freq] = {};
  }
  
  var buf = new Buffer(duration * SAMPLE_PRECISION * 2);
  var gen = waveGenerator(freq, wave);

  for(t = 0; t < buf.length; t += 4) {
    gen(t, buf);
  }
  console.log(t);
  // 
  // console.log(buf);
  // 
  
  freqMemo[duration] = buf;
  
  return buf;
  
};