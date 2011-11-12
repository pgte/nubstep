var kSamplesPerSecond= 44100;

module.exports = function(freq) {
  var period = Math.round(kSamplesPerSecond / freq);
  var halfPeriod = Math.floor(period / 2);
  var m = halfPeriod;
  
  return function(t) {
    var α= (freq* 2* Math.PI* t/ kSamplesPerSecond) % (2* Math.PI);
    return ( α/ Math.PI)- 1;
  };
};
