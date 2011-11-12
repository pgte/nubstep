var Hook = require('hook.io').Hook;
var maestro = require('./lib/maestro')();
var Knob = require('./lib/knob');
var InnertialKnob = require('./lib/innertial_knob');

var Sound = require('sound/build/default/sound');
var sound1 = Sound.create(Sound.bufferifySync(__dirname + '/samples/dubstep.wav'));
var sound1Playing = false;
var sound2 = Sound.create(Sound.bufferifySync(__dirname + '/samples/dubstep2.wav'));
var sound2Playing = false;

var sample1 = Sound.create(Sound.bufferifySync(__dirname + '/samples/sample1.wav'));
var sample1Playing = false;

var freq = 100;
var envelopeFreq = 2;
var distortion = 0.5;

var MAX_KNOB_VALUE = 1023;
var MID_KNOB_VALUE = 512;

maestro.setWave('sine');
maestro.setFreq(freq);
maestro.setEnvelopeFreq(envelopeFreq);
maestroPlaying = false;

var KNOB_MAP = [];

KNOB_MAP[0] = Knob('SOUND2', this, function(val) {
  if (val > MID_KNOB_VALUE) {
    return true;
  } else {
    return false;
  }
}, function(val) {
  if (val && ! sound1Playing) {
    sound2.play();
  } else {
    sound2Playing = false;
    sound2.pause();
  }
});

KNOB_MAP[1] = Knob('FREQ', maestro, function(val) { return val / 4.0; }, maestro.setFreq);
KNOB_MAP[2] = Knob('ENVELOPE FREQ', maestro, function(val) { return val / 100.0;  }, maestro.setEnvelopeFreq)
KNOB_MAP[3] = Knob('DISTORTION VOLUME', maestro, function(val) { return val / 10.0; }, maestro.setDistortionVolume)
KNOB_MAP[4] = Knob('SAMPLE1', this, function(val) {
  if (val > MID_KNOB_VALUE) {
    return true;
  } else {
    return false;
  }
}, function(val) {
  if (val && ! sample1Playing) {
    sample1.play();
  } else {
    sample1Playing = false;
    sample1.pause();
  }
});

KNOB_MAP[5] = Knob('SOUND1', this, function(val) {
  if (val > MID_KNOB_VALUE) {
    return true;
  } else {
    return false;
  }
}, function(val) {
  if (val && ! sample1Playing) {
    sound1.play();
  } else {
    sound1Playing = false;
    sound1.pause();
  }
});

// KNOB_MAP[5] = Knob('PWM WIDTH', maestro, function(val) { return val / MAX_KNOB_VALUE }, maestro.setPwmFilterWidth)

var MAX = 1023;

function Hoooker (options) {
  var self = this;
  Hook.call(this, options);

  this.on('hook::ready', function() {
    // sound1.loop(1000).play();
    setTimeout(function() {
      // sound2.loop(1000).play();
      maestro.start();

      self.on('serial::knobs', function(data) {
        Object.keys(data).forEach(function(key) {
          var value = parseInt(data[key], 10);
          var fun = KNOB_MAP[parseInt(key, 10)];
          if (fun) {
            fun(value);
          }
        });
      });
      
    }, 0);
    
  });
};

require('util').inherits(Hoooker, Hook);

var hooker = new Hoooker();

hooker.start();