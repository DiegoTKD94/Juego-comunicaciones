var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 1000,
    height: 700,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 400 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    } 
};

var game = new Phaser.Game(config);

function preload() {
    this.load.image('fondo', './assets/fondo.png');   //Carga imagen del fondo del juego.
    this.load.image('suelo', './assets/suelo.png');   //Carga imagen del suelo.
    this.load.image('base', './assets/base.png');   //Carga imagen de la base del mapa.
    //Carga la imagen de los diferentes tipos de personaje.
    this.load.image('sonic', './assets/sonic.png');
    this.load.image('ray', './assets/ray.png');
    this.load.image('armadillo', './assets/armadillo.png');
    this.load.image('miles', './assets/miles.png');
    this.load.image('knuckles', './assets/knuckles.png');
}

var platforms;

function create() {

    this.add.image(400, 300, 'fondo');
    platforms = this.physics.add.staticGroup();

    platforms.create(400, 690, 'base').setScale(1.5).refreshBody();
    //Creando las superficies de abajo hacia arriba.
    platforms.create(760, 590, 'suelo').setScale(0.4).refreshBody();
    platforms.create(240, 590, 'suelo').setScale(0.4).refreshBody();
    platforms.create(500, 550, 'suelo').setScale(0.4).refreshBody();
    platforms.create(-20, 550, 'suelo').setScale(0.4).refreshBody();
    platforms.create(1020, 550, 'suelo').setScale(0.4).refreshBody();
    platforms.create(300, 480, 'suelo').setScale(0.4).refreshBody();
    platforms.create(750, 480, 'suelo').setScale(0.4).refreshBody();
    platforms.create(550, 410, 'suelo').setScale(0.4).refreshBody();
    platforms.create(920, 410, 'suelo').setScale(0.4).refreshBody();
    platforms.create(90, 410, 'suelo').setScale(0.4).refreshBody();
    platforms.create(1030, 340, 'suelo').setScale(0.4).refreshBody();
    platforms.create(350, 340, 'suelo').setScale(0.4).refreshBody();
    platforms.create(800, 280, 'suelo').setScale(0.4).refreshBody();
    platforms.create(520, 280, 'suelo').setScale(0.4).refreshBody();
    platforms.create(190, 270, 'suelo').setScale(0.4).refreshBody();
    platforms.create(890, 220, 'suelo').setScale(0.4).refreshBody();



    var self = this;
    this.socket = io();
    this.enemigos = this.physics.add.group();

    

    this.socket.on('currentPlayers', function (players) {
        Object.keys(players).forEach(function (id) {
            if (players[id].playerId === self.socket.id) {
                addPlayer(self, players[id]);
            } else {
                addenemigos(self, players[id]);
            }
        });
    });

    this.socket.on('newPlayer', function (playerInfo) {
        addenemigos(self, playerInfo);
    });

    this.socket.on('disconnect', function (playerId) {
        self.enemigos.getChildren().forEach(function (enemigo) {
        if (playerId === enemigo.playerId) {
            enemigo.destroy();
        }
        });
    });

    this.socket.on('playerMoved', function (playerInfo) {
        self.enemigos.getChildren().forEach(function (enemigo) {
            if (playerInfo.playerId === enemigo.playerId) {
                enemigo.setPosition(playerInfo.x, playerInfo.y);
            }
        });
    });
    //Se agregan las teclas activas.
    this.cursors = this.input.keyboard.createCursorKeys();
    
}

function update() {

    if (this.jugador) {
        // Emite el movimiento del jugador
        var x = this.jugador.x;
        var y = this.jugador.y;
        if (this.jugador.oldPosition && (x !== this.jugador.oldPosition.x || y !== this.jugador.oldPosition.y)) {
            this.socket.emit('playerMovement', { x: this.jugador.x, y: this.jugador.y});
        }
    
        // Guarda los datos de la antigua posición del jugador.
        this.jugador.oldPosition = {
            x: this.jugador.x,
            y: this.jugador.y,
        };
        // Acciones de las teclas.
        if (this.cursors.left.isDown)
        {
            this.jugador.setVelocityX(-160);
            this.jugador.flipX=true;
        }
        else if (this.cursors.right.isDown)
        {
            this.jugador.setVelocityX(160);
            this.jugador.flipX=false;
        }
        else
        {
            this.jugador.setVelocityX(0);
        }

        if (this.cursors.up.isDown && this.jugador.body.touching.down)
        {
            this.jugador.setVelocityY(-250);
        }
        
        //this.physics.world.wrap(this.jugador, 5); //No entiendo con exactitud lo que hace.
    }
}

//Función que maneja las particularidades iniciales de cada jugador que se crea.
function addPlayer(self, playerInfo) {
    if (playerInfo.tipoPersonaje == 0) {
        self.jugador = self.physics.add.image(playerInfo.x, playerInfo.y, 'sonic').setOrigin(0.5, 0.5);
    } else if(playerInfo.tipoPersonaje == 1 ){
        self.jugador = self.physics.add.image(playerInfo.x, playerInfo.y, 'ray').setOrigin(0.5, 0.5);
    }else if(playerInfo.tipoPersonaje == 2 ){
        self.jugador = self.physics.add.image(playerInfo.x, playerInfo.y, 'armadillo').setOrigin(0.5, 0.5);
    }else if(playerInfo.tipoPersonaje == 3 ){
        self.jugador = self.physics.add.image(playerInfo.x, playerInfo.y, 'miles').setOrigin(0.5, 0.5);
    }else{
        self.jugador = self.physics.add.image(playerInfo.x, playerInfo.y, 'knuckles').setOrigin(0.5, 0.5);
    }

    self.jugador.setBounce(0.1);
    self.jugador.setCollideWorldBounds(true);
    self.physics.add.collider(self.jugador, platforms);
}

//Función que maneja las particularidades iniciales de cada enemigo que se crea.
function addenemigos(self, playerInfo) {
    if (playerInfo.tipoPersonaje == 0) {
        self.enemigo = self.physics.add.image(playerInfo.x, playerInfo.y, 'sonic').setOrigin(0.5, 0.5);
    } else if(playerInfo.tipoPersonaje == 1 ){
        self.enemigo = self.physics.add.image(playerInfo.x, playerInfo.y, 'ray').setOrigin(0.5, 0.5);
    }else if(playerInfo.tipoPersonaje == 2 ){
        self.enemigo = self.physics.add.image(playerInfo.x, playerInfo.y, 'armadillo').setOrigin(0.5, 0.5);
    }else if(playerInfo.tipoPersonaje == 3 ){
        self.enemigo = self.physics.add.image(playerInfo.x, playerInfo.y, 'miles').setOrigin(0.5, 0.5);
    }else{
        self.enemigo = self.physics.add.image(playerInfo.x, playerInfo.y, 'knuckles').setOrigin(0.5, 0.5);
    }
    self.enemigo.setBounce(0.1);
    self.enemigo.setCollideWorldBounds(true);
    self.physics.add.collider(self.enemigo, platforms);
    self.enemigo.playerId = playerInfo.playerId;
    self.enemigos.add(self.enemigo);
}