module.exports = function() {
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
        socket.on('disconnect', function() {
            var name_leave = people[socket.id];
            socket.broadcast.to(roomnum).emit('leftus', name_leave + ' has left!');
            //console.log(people[socket.id] + ' disconnected!');
            console.log(people[socket.id] + ' disconnected!');
            delete people[socket.id];
        });
    });
}
