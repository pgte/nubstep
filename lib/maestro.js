var Sound = require('../node_modules/sound/build/default/sound.node');

var SAMPLE_FREQ = 44100;
var DELAY_BUFFERS = 3;
var QUANT = 100;

var LFO = require('./lfo');

module.exports = function() {
  var freq = 200;
  
  var intervals = {}
    , playing = false;
  
  var queue = [];

  var durationSecs, duration, durationMs;

  function calculateBufferDuration() {
    durationSecs = QUANT / freq;
    duration = Math.ceil(durationSecs * SAMPLE_FREQ);
    durationMs = durationSecs * 1000;
    console.log('durationSecs:', durationSecs);
    console.log('duration:', duration);
  };
  
  calculateBufferDuration();
  
  function setFreq(_freq) {
    freq = _freq;
    calculateBufferDuration();
  }
  
  function play() {
    if (playing) {
      if (! intervals.play) {
        intervals.play = setInterval(play, durationMs);
      }
      process.stdout.write('-');
      var sound = queue.shift();
      if (sound) {
        sound.play();
      } else {
        throw new Error('Warning: buffer underrun');
      }
    }
  }
  
  function start() {
    if (! playing) {
      playing = true;
      
      intervals.lfo = setInterval(function() {
        process.stdout.write('+');
        queue.push(
          Sound.create(LFO({
            duration: duration
          , freq: freq
          }))
        );
      }, durationMs);
      
      console.log('duration (ms):', durationMs);
      
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
