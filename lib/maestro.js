var Player = require('roar').create;

var SAMPLE_FREQ = 44100;
var DELAY_BUFFERS = 3;
var QUANT = 1;

var LFO = require('./lfo');
var EnvelopeFilter = require('../filter/envelope');
var out = require('./out');

module.exports = function() {
  var freq = 200
    , wave = 'sine';
  
  var player
    , intervals = {}
    , playing = false;
  
  var durationSecs, duration, durationMs;
  
  var filter = EnvelopeFilter(3);
  
  function calculateBufferDuration() {
    duration = Math.ceil(SAMPLE_FREQ / freq);
    durationSecs = duration / SAMPLE_FREQ;
    durationMs = durationSecs * 1000;
    console.log('durationSecs:', durationSecs);
    console.log('duration:', duration);
  };
  
  calculateBufferDuration();
  
  function setFreq(_freq) {
    freq = _freq;
    calculateBufferDuration();
  }
  
  function setEnvelopeFreq(freq) {
    filter.freq(freq);
  }
  
  function setWave(_wave) {
    wave = _wave;
  }
  
  function start() {
    var time = 0;
    
    if (! playing) {
      playing = true;
      if (! player) {
        player = Player();
      }
      
      intervals.lfo = setInterval(function() {
        var buf;

        time += durationMs;
        
        buf = LFO({
          duration: duration
        , freq: freq
        , wave: wave
        });
        
        player.push(out(filter(time, buf)));
        
      }, durationMs);
      
      setTimeout(function() {
        player.play();
      }, Math.ceil(durationMs * (DELAY_BUFFERS + 0.5)));
      
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
    , setEnvelopeFreq: setEnvelopeFreq
    , setWave: setWave
    , start: start
    , stop: stop
  }
  
}
