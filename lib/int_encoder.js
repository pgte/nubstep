function lonibble (integer) {
  return integer & 0x00ff;
}

function hinibble (integer) {
  return (integer & 0xff00) >>> 8;
}

function floatToSignedInteger (value) {
  //converts from float value in the range -1..1 to a 16bits signed integer

  if (value > 1) value= 1;
  else if (value < -1) value= -1;
  value= Math.floor(32767*value);
  return {
      hi : hinibble(value)
    , lo : lonibble(value)
    , v:value
  };
}

module.exports = floatToSignedInteger;