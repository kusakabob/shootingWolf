
var Game = {};

Game.init = function(){
    game.stage.disableVisibilityChange = true;
};

Game.preload = function() {
    game.load.tilemap('map', 'assets/map/example_map.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.spritesheet('tileset', 'assets/map/tilesheet.png',32,32);
    game.load.image('sprite','assets/sprites/sprite.png');
    game.load.image('bullet', 'assets/sprites/bullet.png');  
};

Game.create = function(){
    Game.playerMap = {};
    Game.idArray = [];
    Game.spawnCounter = 1;
    //ctrl players
    Game.playerCount = 0;
    Game.go = false;
   

    var map = game.add.tilemap('map');
    map.addTilesetImage('tilesheet', 'tileset'); // tilesheet is the key of the tileset in map's JSON file
    Game.layer;
    for(var i = 0; i < map.layers.length; i++) {
        Game.layer = map.createLayer(i);
    }
    Game.layer.inputEnabled = true; // Allows clicking on the map ; it's enough to do it on the last layer

    Game.spawnPoints = map.objects.spawnPoint;

    game.world.setBounds(0, 0, 1152, 1152);

    Game.playersNum = game.add.text(game.camera.width - 150,10,"Players: " + Game.playerCount.toString(),{
        fill:"white"
    });
    Game.playersNum.fixedToCamera = true;
    Game.readyText = game.add.text(game.camera.width/2,game.camera.height/2,"Enter key starts the game",{
    })

  


    Game.initBullets();// should be after maplayer; otherwise it go beneath
    
    TODO: //ask server

    Client.askNewPlayer();
    

};



Game.initBullets = function(){
    Game.playerBullets = game.add.group();
    Game.playerBullets.enableBody = true;
    Game.playerBullets.physicsBodyType = Phaser.Physics.ARCADE;
  }

Game.addNewPlayer = function(id,x,y,posNum,hp,alive){
    
    TODO:
    // ask to server if started
    if (Game.go) return;

    Game.idArray.push(id);
    Game.playerCount ++;
    Game.playersNum.text = "Players: " + Game.playerCount.toString();
    

    function compareNumbers(a, b) {
        return a - b;
      }

      Game.idArray.sort();
      console.log(Game.idArray);
    
    var _x = 0;
    var _y = 0;

    for (var i = 0; i < Game.spawnPoints.length; i++){
        if (parseInt(Game.spawnPoints[i].name) == posNum){
        _x = Game.spawnPoints[i].x;
        _y = Game.spawnPoints[i].y;
        }
    }

    Game.playerMap[id] = game.add.sprite(_x,_y,'sprite');
    Game.playerMap[id].angle = 90;

    Game.playerMap[id].initialPos = new Phaser.Point(_x,_y);
    
    game.physics.arcade.enable(Game.playerMap[id]);
    Game.playerMap[id].body.collideWorldBounds = true;
    Game.playerMap[id].anchor.setTo(0.5);
    Game.playerMap[id].id = id;
    Game.playerMap[id].hp = hp;
    Game.playerMap[id].alive = alive;
    Game.playerMap[id].ui = game.add.group();

    
    Game.playerMap[id].ui.hp = game.add.text(28,10,"HP: " + Game.playerMap[id].hp.toString(),{
        //option
        fill: "white",
    });
    Game.playerMap[id].ui.hp.fixedToCamera = true;
    Game.playerMap[id].ui.hp.visible = false;

    //ui ctrl
    Client.askMe();

    console.log(Game.playerMap);


    TODO:
    // until 4 players
    // if (Game.idArray.length > 3){}
    
    //to not overwrite inputs
    if (!Game.layer.events.onInputDown._bindings){
    console.log("binded!",id)
    game.camera.follow(Game.playerMap[id]);
    Game.layer.events.onInputDown.add(Game.getCoordinates,{id:id});
    Game.arrowCtrl(id);
    }
    
};

Game.prepareUI = function(player){
    
    for (var i = 0; i < Game.idArray.length; i++){
        if (Game.playerMap[player.id] && player.id == Game.idArray[i]){
            console.log("visible",player.id);
            console.log(player.id);
            Game.playerMap[player.id].ui.hp.visible = true;
        }
    }
}
 
Game.getCoordinates = function(layer,pointer){
    if (Game.playerMap[this.id].alive && Game.go) {
    var rotation = game.physics.arcade.angleToPointer(Game.playerMap[this.id]);
    Client.sendRot(rotation);
    Client.sendClick(pointer.worldX,pointer.worldY);
    }
};

Game.arrowCtrl = function(id){
    var pl = Game.playerMap[id];
    var leftArrow = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    var rightArrow = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    var upArrow = game.input.keyboard.addKey(Phaser.Keyboard.UP);
    var downArrow = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
    var testKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
    testKey.onDown.add(
        function(){
            
            Client.gameStart();
            TODO:// ask server if game started?
            Game.readyText.destroy();
        }, this);

    pl.leftAr = false;
    pl.rightAr = false;
    pl.upAr = false;
    pl.downAr = false;
    

    leftArrow.onDown.add(()=>Game.keyChecker(pl,"left"),this);
    rightArrow.onDown.add(()=>Game.keyChecker(pl,"right"),this);
    upArrow.onDown.add(()=>Game.keyChecker(pl,"up"),this);
    downArrow.onDown.add(()=>Game.keyChecker(pl,"down"),this);

    leftArrow.onUp.add(()=>{
        pl.leftAr = false
        Client.sendDir(pl)
    },this);
    rightArrow.onUp.add(()=>{
        pl.rightAr = false
        Client.sendDir(pl)
    },this);
    upArrow.onUp.add(()=>{
        pl.upAr = false
        Client.sendDir(pl)
    },this);
    downArrow.onUp.add(()=>{
    pl.downAr = false
        Client.sendDir(pl)
    },this);

    
}

Game.keyChecker = function(pl,dir){
    if (dir == "left") {
        pl.leftAr = true;
        pl.rightAr = false;
    }
    else if (dir == "right") {
        pl.rightAr = true;
        pl.leftAr = false;
    }
    else if (dir == "up") {
        pl.upAr = true;
        pl.downAr = false;
    }
    else if (dir == "down") {
        pl.downAr = true;
        pl.upAr = false;
    }

    Client.sendDir(pl);
}

Game.shoot = function(id,x,y,rotation){
    if(!Game.playerMap[id]) return;
    if(Game.playerMap[id].ghost) return;
    var bullet = Game.playerBullets.getFirstExists(false);
   
    //only create a bullet if there are no dead ones available to reuse
    if(!bullet) {
      bullet = new Game.Bullet(game,Game.playerMap[id].x, Game.playerMap[id].y); 
      bullet.id = id;   
      Game.playerBullets.add(bullet);
    }
    else {
      //reset position
      bullet.id = id;
      bullet.reset(Game.playerMap[id].x, Game.playerMap[id].y);
    }
    
    var deg = rotation * 180 / Math.PI;

    game.physics.arcade.velocityFromAngle(deg, 750, bullet.body.velocity);

};

Game._movePlayer = function(id,x,y,dir){
    if (!Game.playerMap[id]) return;
    console.log("moving",id)
    Game.ctrlId = id;
    Game.playerMap[id].direction = dir;
    
}

Game.rotatePlayer = function (id,degree){
    if (!Game.playerMap[id]) return;
    Game.playerMap[id].rotation = degree;
}

Game.removePlayer = function(id){

    if (!Game.playerMap[id]) return;
    Game.readyText.destroy();
    delete Game.playerMap[id];

};

Game.gameOver= function(id,alive,text){
    if (!Game.playerMap[id]) return;
    //dead
    Game.playerMap[id].alive = alive
    console.log("gameOver",text);
}

Game.update = function(){ 
    
    Game.camera.setBoundsToWorld()
        for (var i = 0; i < Game.idArray.length; i++){
        var player = Game.playerMap[Game.idArray[i]];
        

        //reborn
        if (player && !player.alive){
            console.log(player.id,"dead");
            player.alive = true;
            player.x = player.initialPos.x;
            player.y = player.initialPos.y;
            player.ghost = true;
            player.visible = false;
            player.alpha = 0.9;
            
        }
            
            // except myself
        game.physics.arcade.overlap(player,Game.playerBullets, Game.takeDamage, null);
     

    if (player && player.direction){
        if (player.direction[0]) player.x += 5;
        else if(player.direction[2]) player.x -= 5;

        if (player.direction[3]) player.y -= 5;
        else if(player.direction[1]) player.y += 5;
        }

        }     
}

Game.takeDamage = function(player,bullet){
    
    if (player.id == bullet.id) return;
    if (player.ghost) return;
    player.hp --;
    console.log("takeDamage",player.id,player.hp);
    Game.camera.shake(0.01,100,true,)
    Client.takeDamage(player.id,player.hp);
    if (player.hp <= 0){
        //player.alive = false;
        //player.visible = false;
        //Game.removePlayer(player.id);
        Game.playerCount --;
        Game.playersNum.text = "Players: " + Game.playerCount.toString();
        Client.sendDead(player);
    }

    bullet.kill();
}

Game.updateHp = function(id,hp){
    var player = Game.playerMap[id];
    player.ui.hp.text = "HP:" + hp;
    
    if (hp <= 1) player.ui.hp.addColor("#ff0000", 0);
}