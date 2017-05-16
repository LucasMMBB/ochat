var name, name1, name2, state;
// Socket IO
var socket = io();
// define functions
function startChat() {
    // send private chat invitations. name1 is sender's name, name2 is reciver's name..Event: end-to-end
    name1 = name;
    var x = event.target;
    name2 = x.parentElement.children[1].innerText;
    state = 0; // invitation to be determined
    socket.emit("end-to-end", name1, name2, state);
}


function appendName(name, color = false) {
    if (!color) {
        return '<li class="list-group-item"><a class="badge" onclick="startChat()">chat</a><span class="onlinelistname">' + name + '</span></li>';
    } else {
        return '<li class="list-group-item darkseagreen">' + name + '</li>';
    }

}

$(document).ready(function() {
    $("#oc-privatechat").hide();
    $("#oc-chat").hide();
    $('#oc-join').submit(function() {
        name = $("#nickname").val();
        var room = $("input[name='inlineRadioOptions']:checked").val();
        var name_oc = 'Me( ' + name + ' )';
        if (name != "" && $("input[name='inlineRadioOptions']:checked").val()) {
            if (room === 'room1') {
                $('#oc-roomtitle').text(" room 1");
            } else if (room === 'room2') {
                $('#oc-roomtitle').text(" room 2");
            } else {
                $('#oc-roomtitle').text(" room 3");
            }
            socket.emit("join", name, room);
            $("#oc-login").remove();
            $("#oc-chat").show();
            //$('#oc-onlinelist').append($('<li class="list-group-item darkseagreen">').text(name_oc));
            $('#oc-onlinelist').append(appendName(name_oc, true));
        } else {
            alert('Please fill out username and room!');
        }
        return false;
    });
    $('.chat').submit(function() {
        //var room = $("input[name='inlineRadioOptions']:checked").val();
        socket.emit('chat message', name, $('#m').val());
        $('#messages').append($('<li>').text(name + ': ' + $('#m').val()));
        $('#m').val('');
        return false;
    });
    $('#oc-pchat-sbt').submit(function() {
        // one to one private chat
        $('#oc-privatechat-messages').append($('<li class="list-group-item list-group-item-info alignright">').text($('#oc-pchat-text').val()));
        if (name === name1) {
            socket.emit('oc-pchat', name2, $('#oc-pchat-text').val());
        } else if (name === name2) {
            socket.emit('oc-pchat', name1, $('#oc-pchat-text').val());
        } else {}
        $('#oc-pchat-text').val('');
        return false;
    });
    socket.on('joinus', function(msg1, msg2) {
        $('#messages').append($('<li class="notice-joinus">').text(msg2));
        //$('#oc-onlinelist').append($('<li class="list-group-item">').text(msg1));
        $('#oc-onlinelist').append(appendName(msg1));
    });
    socket.on('leftus', function(msg) {
        $('#messages').append($('<li class="notice-leftus">').text(msg));
    });
    socket.on('private message', function(name, msg) {
        $('#messages').append($('<li class="list-group-item">').text(name + ': ' + msg));
    });
    socket.on('end-to-end', (nm1, nm2, state) => {
        if (state === 0) {
            // invitation TBD
            if (name === nm2) { // determine if this is invitation's receiver
                if (confirm(nm1 + ' wants to talk with you?')) {
                    console.log("start chat!");
                    // show the private chat bar!
                    $("#oc-privatechat").show();
                    // send back the confirmation: yes or no
                    state = 1; // yes, accept chat
                    name1 = nm1;
                    name2 = nm2;
                    socket.emit('end-to-end', nm1, nm2, state);
                } else {
                    console.log(nm2 + " don't want to chat with " + nm1);
                    state = 2; // no, refuse chat
                    socket.emit('end-to-end', nm1, nm2, state);
                }
            }
        } else if (state === 1) {
            if (name === nm1) { // determin if this is invitation's sender
                alert("start your chat now!");
                $("#oc-privatechat").show();
            }
        } else if (state === 2) {
            if (name === nm1) {
                alert("Your invitation was declined");
            }
        } else {
            // do nothing
        }
    });
    socket.on('oc-pchat', (nm, msg) => {
        if (name === nm) { // determin if this is receiver
            $('#oc-privatechat-messages').append($('<li class="list-group-item list-group-item-success alignleft">').text(msg));
        }
    });
});
