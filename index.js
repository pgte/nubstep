var maestro = require('./lib/maestro')();
var freq = 50;
maestro.setFreq(freq);
maestro.start();

setTimeout(function() {
  maestro.stop();
}, 100000)