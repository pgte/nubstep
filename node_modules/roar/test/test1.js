// tests proper destruction/absence of leaks when there's unreferenced sound (and buffer) objects that are still play()ing.

var Player = require('../build/default/player');

var player = Player.create();
countdown = 1000;

while(countdown) {
  player.push(new Buffer(100 * 4));
  countdown --;
}
player.play();
process.stdout.write('.');

setTimeout(function() {
  
}, 2000);