var Game = Game || {};

Game.Bullet = function(game,x,y){
Phaser.Sprite.call(this, game, x, y, 'bullet');


  this.anchor.setTo(0.5);
  this.checkWorldBounds = true;
  this.outOfBoundsKill = true;
}

Game.Bullet.prototype = Object.create(Phaser.Sprite.prototype);
Game.Bullet.prototype.constructor = Game.Bullet;