var maestro = require('./lib/maestro')();
maestro.start();

setTimeout(function() {
  maestro.stop();
}, 10000)