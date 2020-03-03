var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var players = {};

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

// io.connect('http://192.168.1.15:8081',{'forceNew':true}); //Dirección para conectar en la misma red.

io.on('connection', function(socket) {
    console.log('a user connected');
    // Crea un nuevo jugador y lo agrega a nuestro objeto de jugadores.
    players[socket.id] = {
        x: Math.floor(Math.random() * 700) + 50, //Posición aleatoria en x para su apareción.
        y: Math.floor(Math.random() * 500) + 50, //Posición aleatoria en y para su aparición.
        playerId: socket.id,
        tipoPersonaje: (Math.floor(Math.random() * 5)) //Número del personaje.
    };

    socket.emit('currentPlayers', players); // Envía el objeto de jugadores al nuevo jugador.

    socket.broadcast.emit('newPlayer', players[socket.id]); // Actualiza a todos los jugadores el nuevo jugador.

    socket.on('disconnect', function() {
        console.log('user disconnected');

        delete players[socket.id]; // Remueve al jugador del objeto jugadores.

        io.emit('disconnect', socket.id); // Envía un mensaje a todos los jugadores para remover a éste jugador.
    });

    // Cuando un jugador se mueve, actualiza la información del mismo.
    socket.on('playerMovement', function(movementData) {
        players[socket.id].x = movementData.x;
        players[socket.id].y = movementData.y;

        // Emite un mensaje a todos los jugadores sobre el movimiento del jugador.
        socket.broadcast.emit('playerMoved', players[socket.id]);
    });
});

// Dejamos al servidor escuchando.
server.listen(8081, function() {
    console.log(`Listening on ${server.address().port}`);
});