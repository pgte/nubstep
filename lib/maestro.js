var Player = require('roar').create;

var SAMPLE_FREQ = 44100;
var DELAY_BUFFERS = 3;
var QUANT = 10;

var osc = require('./osc');
var PwmFilter = require('../filter/pwm');
var EnvelopeFilter = require('../filter/envelope');
var DistortFilter = require('../filter/distort');
var DelayFilter = require('../filter/delay');
var out = require('./out');

module.exports = function() {
  var freq = 200
    , wave = 'sine';
  
  var player
    , playing = false;
  
  var durationSecs, duration, durationMs;
  
  var pwmFilter = PwmFilter(4, 0.5);
  var envelopeFilter = EnvelopeFilter(3);
  var distortFilter  = DistortFilter(2);
  var delayFilter  = DelayFilter(6);
  var filters = [
      envelopeFilter
    , distortFilter
    // , pwmFilter
    // , delayFilter
  ]
  
  function calculateBufferDuration() {
    duration = Math.ceil(SAMPLE_FREQ / freq) * QUANT;
    durationSecs = duration / SAMPLE_FREQ;
    durationMs = durationSecs * 1000;
  };
  
  calculateBufferDuration();
  
  function setFreq(_freq) {
    if (_freq < 1) { return; }
    freq = _freq;
    calculateBufferDuration();
  }
  
  function setPwmFilterFreq(freq) {
    pwmFilter.freq(freq);
  }
  
  function setPwmFilterWidth(width) {
    pwmFilter.pulseWidth(width);
  }
  
  function setEnvelopeFreq(freq) {
    envelopeFilter.freq(freq);
  }
  
  function setDistortionVolume(volume) {
    distortFilter.volume(volume);
  }
  
  function setWave(_wave) {
    wave = _wave;
  }
  
  function start() {
    var time = 0;
    // var sentDuration = 0;
    
    if (! playing) {
      playing = true;
      if (! player) {
        player = Player();
      }
      
      function cycle() {
        var buf;
        if (! playing) { return; }
        
        setTimeout(cycle, durationMs - 1);

        time += duration;
        
        buf = osc({
          duration: duration
        , freq: freq
        , wave: wave
        });
        
        filters.forEach(function(filter) {
          buf = filter(time, buf)
        });
        
        player.push(out(buf));

        lastTime = Date.now()

        // sentDuration += duration;
        // console.log('time:', time, ', sentDuration:', sentDuration / 44.100);
        
      }
      
      setTimeout(cycle, durationMs);
      
      setTimeout(function() {
        player.play();
      }, Math.ceil(durationMs * (DELAY_BUFFERS + 0.5)));
      
    }
  }
  
  function stop() {
    if (playing) {
      playing = false;
    }
  }
  
  return {
      setFreq: setFreq
    , setPwmFilterFreq: setPwmFilterFreq
    , setPwmFilterWidth: setPwmFilterWidth
    , setEnvelopeFreq: setEnvelopeFreq
    , setDistortionVolume: setDistortionVolume
    , setWave: setWave
    , start: start
    , stop: stop
  }
  
}