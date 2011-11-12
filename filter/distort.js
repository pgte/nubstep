var kSamplesPerSecond= 44100;

module.exports = function(volume) {
  function distortFilter(startT, buf) {
    var t = startT
      , retBuf = [];

    for(i = 0; i < buf.length; i++) {
      retBuf.push(buf[i] * volume);
      t ++;
    }
    return retBuf;
  }
  
  distortFilter.volume = function(_volume) {
    if (_volume < 1) {
      _volume = 1;
    }
    volume = _volume;
  }
  
  return distortFilter;
};