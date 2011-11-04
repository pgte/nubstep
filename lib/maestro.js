var Sound = require('../node_modules/sound/build/default/sound.node');

var SAMPLE_FREQ = 44100;
var DELAY_BUFFERS = 2;
var QUANT = 1;

var LFO = require('./lfo');

module.exports = function() {
  var freq = 20;
  var waveCount = 1;
  
  var intervals = {}
    , playing = false;
  
  var queue = [];

  var waveDuration = Math.ceil((1 / freq) * SAMPLE_FREQ);
  var durationSecs, duration, durationMs;

  function calculateBufferDuration() {
    durationSecs = (waveCount / freq) * QUANT;
    duration = Math.ceil(durationSecs * SAMPLE_FREQ);
    durationMs = durationSecs * 1000;
  };
  
  calculateBufferDuration();
  console.log('durationSecs:', durationSecs);
  console.log('duration:', duration);
  
  function setFreq(_freq) {
    freq = _freq;
    calculateBufferDuration();
  }
  
  function play() {
    if (playing) {
      intervals.play = setInterval(function() {
        var sound = queue.shift();
        if (sound) {
          sound.play();
        } else {
          throw new Error('Warning: buffer underrun');
        }
      }, durationMs);
    }
  }
  
  function start() {
    if (! playing) {
      playing = true;
      
      intervals.lfo = setInterval(function() {
        queue.push(
          Sound.create(LFO({
            duration: duration
          , freq: freq
          }))
        );
      }, durationMs);
      
      console.log('frequency (ms):', durationMs);
      
      setTimeout(play, durationMs * DELAY_BUFFERS);
      
    }
  }
  
  function stop() {
    if (playing) {
      playing = false;
      Object.keys(intervals).forEach(function(intervalKey) {
        clearInterval(intervals[intervalKey]);
      });
      queue = [];
    }
  }
  
  return {
      setFreq: setFreq
    , start: start
    , stop: stop
  }
  
}
