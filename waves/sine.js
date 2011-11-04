var kChannels= 2;
var kBytesPerSample= 2;
var kSamplesPerSecond= 44100;
var kStep= kChannels* kBytesPerSample;

function floatToSignedInteger (value) {
  //converts from float value in the range -1..1 to a 16bits signed integer

  function lonibble (integer) {
    return integer & 0x00ff;
  }

  function hinibble (integer) {
    return (integer & 0xff00) >>> 8;
  }

  if (value > 1) value= 1;
  else if (value < -1) value= -1;
  value= Math.floor(32767*value);
  return {
      hi : hinibble(value)
    , lo : lonibble(value)
    , v:value
  };
}

module.exports = function(freq) {
  return function(t, buffer) {
    var α= (freq * 2 * Math.PI * t / kSamplesPerSecond / kStep) % (2* Math.PI);
    var sample= floatToSignedInteger(Math.sin(α));
    //process.stdout.write([i/step, α, sample.v, sample.hi, sample.lo] + "\r\n");
    buffer[t] = buffer[t+2] = sample.lo;
    buffer[t+1] = buffer[t+3] = sample.hi;
  };
};