var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var iochat = require('./chat.js');

// custom namespace for multichat room
//var nsp = io.of('/my-namespace');

var people = {};
var roomnum; // defalut room number

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/main.css', function(req, res) {
    res.sendFile(__dirname + '/main.css');
});

app.get('/frontend.js', function(req, res) {
    res.sendFile(__dirname + '/frontend.js');
});

//iochat();
io.on('connection', function(socket) {
    socket.on('join', function(name, room) {
        people[socket.id] = name;
        if (room == 'room1') {
            socket.join('room1');
            roomnum = 'room1';
            //console.log(room + ': ' + name + ' connected!');
        } else if (room == 'room2') {
            socket.join('room2');
            roomnum = 'room2';
            //console.log(room + ': ' + name + ' connected!');
        } else {
            socket.join('room3');
            roomnum = 'room3';
            //console.log(room + ': ' + name + ' connected!');
        }
        console.log(room + ': ' + name + ' connected!');
        console.log(people);
        //socket.broadcast.emit('joinus', name, name + ' joins us!');
        // sending to all clients in 'game' room(channel) except sender
        socket.broadcast.to(room).emit('joinus', name, name + ' joins us!');
    });
    socket.on('chat message', function(name, msg) {
        socket.broadcast.to(roomnum).emit('private message', name, msg);
        console.log('message: ' + msg);
    });
    socket.on('end-to-end', (name1, name2, state) => {
        // name1: invitation sender, name2: invitation receiver
        // receive chat requests;
        if (state === 0) {
            console.log(name1 + " wants to start chat with: " + name2);
            socket.broadcast.emit('end-to-end', name1, name2, state);
        } else if (state === 1) {
            // name1 has accepted name2's invitation
            console.log(name1 + " accepted to start chat with: " + name2);
            socket.broadcast.emit('end-to-end', name1, name2, state);
        } else if (state === 2) {
            // name1 has declined name2's invitation
            console.log(name1 + " refused to chat with: " + name2);
            socket.broadcast.emit('end-to-end', name1, name2, state);
        } else {
            // state === 3, Invitation has been diceded.
            // So do nothing.
        }
    });
    socket.on('oc-pchat', (nm, msg) => {
    	socket.broadcast.to(roomnum).emit('oc-pchat', nm, msg);
    });
    socket.on('disconnect', function() {
        var name_leave = people[socket.id];
        socket.broadcast.to(roomnum).emit('leftus', name_leave + ' has left!');
        //console.log(people[socket.id] + ' disconnected!');
        console.log(people[socket.id] + ' disconnected!');
        delete people[socket.id];
    });
});


http.listen(3000, function() {
    console.log('listening on *:3000');
});
