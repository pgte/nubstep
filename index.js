var Hook = require('hook.io').Hook;
var maestro = require('./lib/maestro')();
var Knob = require('./lib/knob');

var freq = 100;
var envelopeFreq = 2;
var distortion = 0.5;

var MAX_KNOB_VALUE = 1023;

maestro.setWave('sine');
maestro.setFreq(freq);
maestro.setEnvelopeFreq(envelopeFreq);

var KNOB_MAP = [];
KNOB_MAP[1] = Knob('FREQ', maestro, function(val) { return (val / 10.0); }, maestro.setFreq);
KNOB_MAP[2] = Knob('ENVELOPE FREQ', maestro, function(val) { return (val >> 1) / 100.0  }, maestro.setEnvelopeFreq)
KNOB_MAP[3] = Knob('DISTORTION VOLUME', maestro, function(val) { return (val / 10.0) }, maestro.setDistortionVolume)
KNOB_MAP[4] = Knob('PWM FREQ', maestro, function(val) { return Math.round(val / 10.0); }, maestro.setPwmFilterFreq)
KNOB_MAP[5] = Knob('PWM WIDTH', maestro, function(val) { return val / MAX_KNOB_VALUE }, maestro.setPwmFilterWidth)

var MAX = 1023;

function Hoooker (options) {
  var self = this;
  Hook.call(this, options);

  this.on('hook::ready', function() {
    maestro.start();
    
    self.on('serial::knobs', function(data) {
      console.log(data);
      Object.keys(data).forEach(function(key) {
        var value = parseInt(data[key], 10);
        var fun = KNOB_MAP[parseInt(key, 10)];
        if (fun) {
          fun(value);
        }
      });
    });
    
  });
};

require('util').inherits(Hoooker, Hook);

var hooker = new Hoooker();

hooker.start();