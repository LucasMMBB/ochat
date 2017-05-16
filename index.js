var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var iochat = require('./chat.js');

var people = {};
var roomnum; // defalut room number
var room1 = {};
var room2 = {};
var room3 = {};

app.use(express.static('public'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('*', function(req, res) {
    res.redirect('/');
});

//iochat();
io.on('connection', function(socket) {
    socket.on('join', function(name, room) {
        people[socket.id] = name;
        if (room == 'room1') {
            room1[socket.id] = name;
            socket.join('room1');
            roomnum = 'room1';
            console.log("/******** The below are room1 ********/");
            console.log(room1);
        } else if (room == 'room2') {
            room2[socket.id] = name;
            socket.join('room2');
            roomnum = 'room2';
            console.log("/******** The below are room2 ********/");
            console.log(room2);
        } else {
            room3[socket.id] = name;
            socket.join('room3');
            roomnum = 'room3';
            console.log("/******** The below are room3 ********/");
            console.log(room3);
        }
        socket.broadcast.to(room).emit('joinus', name, name + ' joins us!');
        console.log(room + ': ' + name + ' connected!');
        console.log(people);
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
        if(room1[socket.id]!=null){
            delete room1[socket.id];
            console.log(room1);
        }else if(room2[socket.id]!=null){
            delete room2[socket.id];
            console.log(room2);
        }else{
            delete room3[socket.id];
            console.log(room3);
        }
        delete people[socket.id];
    });
});


http.listen(3000, function() {
    console.log('listening on *:3000');
});
