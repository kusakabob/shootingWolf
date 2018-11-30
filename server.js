var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

app.use('/css',express.static(__dirname + '/css'));
app.use('/js',express.static(__dirname + '/js'));
app.use('/assets',express.static(__dirname + '/assets'));

app.get('/',function(req,res){
    res.sendFile(__dirname+'/index.html');
});

server.lastPlayderID = 0;

server.listen(process.env.PORT || 8081,function(){
    console.log('Listening on '+server.address().port);
});

//array 

io.on('connection',function(socket){
    //max 4 players
if (getAllPlayers().length > 4) socket.disconnect();
    
    socket.on('start',function(){
        socket.start = true;
        io.emit('start',socket.start);
    })

    socket.on('newplayer',function(){
        socket.player = {
            id: server.lastPlayderID++,
            x: randomInt(100,400),                                                                                                                                                                                                                                                                                                                                                       
            y: randomInt(100,400),
            hp:3,
            rotation:0,
            posNum:1,
            alive:true
        };

        socket.gameData = {
            start:false,
            over: false,
            hpbar:3,
            day:false,
            testText:"Game Over"
        }
        //limit if (getAllPlayers().length <= 2){}

        var posNum = getAllPlayers().length % 4;
        if (posNum == 0) posNum = 4;
        socket.player.posNum = posNum

        socket.broadcast.emit('newplayer',socket.player);
        socket.emit('allplayers',getAllPlayers());
        
        socket.on('askme',function(){
            io.to(socket.id).emit('yourConnection',socket.player);
        })

        socket.on('click',function(data){
            io.emit('shoot',socket.player);
        });

        socket.on('move',function(data){
            
            io.emit('_move',socket.player,data);
        })

        socket.on('rotation',function(data){

            socket.player.rotation = data;
            io.emit('_rotation',socket.player);
        })

        socket.on('damage',function(id,hp){
            var players = getAllPlayers();

            players.forEach(function(player){
                if(player.id == id){
                    player.hp = hp;
                }
            })
             
            socket.emit('updateHp',socket.player.id,socket.player.hp);
        })

        socket.on('gameOver',function(deadId,alive){
            var deadPlayer = null;
            var players = getAllPlayers();
            players.forEach(function(pl){
            if (pl.id == deadId){
            deadPlayer = pl;
            }
            })
            
            deadPlayer.alive = false;
            socket.emit('gameOver',deadPlayer.id,deadPlayer.alive,"text");
        })


        socket.on('disconnect',function(){
            console.log(socket.player.id);
            io.emit('remove',socket.player.id);
        });
    });

    socket.on('test',function(){
        console.log('test received');
    });
});

function getAllPlayers(){
    var players = [];
    Object.keys(io.sockets.connected).forEach(function(socketID){
        var player = io.sockets.connected[socketID].player;
        if(player) players.push(player);
    });
    return players;
}

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}
