var Sound = require('../node_modules/sound/build/default/sound.node');

var SAMPLE_FREQ = 44100;
var DELAY_BUFFERS = 3;
var QUANT = 100;

var LFO = require('./lfo');
var EnvelopeFilter = require('../filter/envelope');
var out = require('./out');

module.exports = function() {
  var freq = 200;
  
  var intervals = {}
    , playing = false;
  
  var queue = [];

  var durationSecs, duration, durationMs;
  
  var filter = EnvelopeFilter(3);
  
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
      // if (! intervals.play) {
      //   intervals.play = setInterval(play, durationMs);
      // }
      process.stdout.write('-');
      var sound = queue.shift();
      if (sound) {
        sound.play(play);
      } else {
        throw new Error('Warning: buffer underrun');
      }
    }
  }
  
  function start() {
    var time = 0;
    
    if (! playing) {
      playing = true;
      
      intervals.lfo = setInterval(function() {
        var buf;

        time += durationMs;
        
        process.stdout.write('+');
        buf = LFO({
          duration: duration
        , freq: freq
        , wave: 'sine'
        });
        
        queue.push(Sound.create(out(filter(time, buf))));
        
      }, durationMs);
      
      setTimeout(play, Math.ceil(durationMs * (DELAY_BUFFERS + 0.5)));
      
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
