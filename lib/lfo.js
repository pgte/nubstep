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
    , sample
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
  
  var buf = [];
  var gen = waveGenerator(freq, wave);

  for(t = 0; t < duration; t ++) {
    buf.push(gen(t));
  }
  
  freqMemo[duration] = buf;
  
  return buf;
};