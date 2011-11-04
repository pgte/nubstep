var Sound = require('../node_modules/sound/build/default/sound.node');

var SAMPLE_FREQ = 44100;
var DELAY_BUFFERS = 2;

var LFO = require('./lfo');

module.exports = function() {
  var freq = 200;
  var waveCount = 1;
  
  var intervals = {}
    , playing = false;
  
  var queue = [];

  var waveDuration = Math.ceil((1 / freq) * SAMPLE_FREQ);
  var durationSecs, duration;

  function calculateBufferDuration() {
    durationSecs = waveCount / freq;
    duration = Math.ceil(durationSecs * SAMPLE_FREQ);
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
      var sound = queue.shift();
      if (sound) {
        sound.play(play);
      } else {
        throw new Error('Warning: buffer underrun');
      }
    }
  }
  
  function start() {
    var durationMs = durationSecs * 1000;
    
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
      clearInterval(intervals.lfo);
      queue = [];
    }
  }
  
  return {
      setFreq: setFreq
    , start: start
    , stop: stop
  }
  
}
