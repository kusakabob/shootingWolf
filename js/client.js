
var Client = {};
Client.socket = io.connect();

Client.gameStart= function(){
    Client.socket.emit('start');
}

Client.sendTest = function(){
    console.log("test sent");
    Client.socket.emit('test');
};

Client.askNewPlayer = function(){
    Client.socket.emit('newplayer');
};

Client.sendClick = function(x,y){
  Client.socket.emit('click',{x:x,y:y});
};

Client.sendDir = function(pl){
    if (!Game.go) return;
    var dir = [false,false,false,false];
    if (pl.rightAr) dir[0] = true;
    if (pl.downAr) dir[1] = true; 
    if (pl.leftAr) dir[2] = true;
    if (pl.upAr) dir[3] = true;
    
    Client.socket.emit('move',dir);
};

Client.sendRot = function(rad){
   
   Client.socket.emit('rotation',rad);
}

Client.sendDead = function(pl){
    
    Client.socket.emit('gameOver',pl.id,pl.alive);
}

Client.takeDamage = function (id,hp){
    
    Client.socket.emit('damage',id,hp)
}

Client.askMe = function(){
    Client.socket.emit("askme");
}

Client.socket.on('start',function(start){
    console.log("start!");
    Game.go = true;
})

Client.socket.on('newplayer',function(data){
    
    Game.addNewPlayer(data.id,data.x,data.y,data.posNum,data.hp,data.alive);
    
});

Client.socket.on('allplayers',function(data){
    console.log('Otherallplayer',data);
//to activate the newest players touch 

    for(var i = 0; i < data.length; i++){
        _i = (data.length - 1) - i;
        Game.addNewPlayer(data[_i].id,data[_i].x,data[_i].y,data[_i].posNum,data[_i].hp,data[_i].alive);
    }

    Client.socket.on('yourConnection',function(player){
        Game.prepareUI(player);
    });
    

    Client.socket.on('shoot',function(data){
        Game.shoot(data.id,data.x,data.y,data.rotation);
    });

    Client.socket.on('_move',function(pl,data){
        Game._movePlayer(pl.id,pl.x,pl.y,data);
    })

    Client.socket.on('_rotation',function(pl){
        Game.rotatePlayer(pl.id,pl.rotation);
    })

    Client.socket.on('updateHp',function(id,hp){
        Game.updateHp(id, hp);
    })

    Client.socket.on('gameOver',function(id,alive,text){
        console.log("over")
        Game.gameOver(id,alive,text);
    })

    Client.socket.on('remove',function(id){
        Game.removePlayer(id);
    })

});


