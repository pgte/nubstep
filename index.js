var maestro = require('./lib/maestro')();
var freq = 50;
var envelopeFreq = 1;

maestro.setWave('triangle');
maestro.setFreq(freq);
maestro.setEnvelopeFreq(envelopeFreq);

maestro.start();

setInterval(function() {
  envelopeFreq +=0.1;
  maestro.setEnvelopeFreq(envelopeFreq);
}, 100);

setTimeout(function() {
  maestro.stop();
}, 100000)