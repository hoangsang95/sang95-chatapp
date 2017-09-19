const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

var { generateMessage, generateLocationMessage } = require('./utils/message');
var { isRealString } = require('./utils/validation');
var { Users } = require('./utils/users');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

var users = new Users();

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log('New user connect.');
    /* 
        socket.emit: sends the message to sender-client only

        io.emit: sendings to all clients, include sender

        socket.broadcast.emit will send the message to all the other clients except the newly created connection
    */

    socket.on('join', (params, callback) => {
        if (!isRealString(params.name) || !isRealString(params.room)) {
            return callback('Name and room name is required');
        }
        socket.join(params.room);

        users.addUser(socket.id, params.name, params.room);

        io.to(params.room).emit('updateUserList', users.getUserList(params.room));

        socket.broadcast.to(params.room).emit('joinAndLeave', `${params.name} has joined room`);

        callback();
    });

    socket.on('createMessage', (message, callback) => {
        var user = users.getUser(socket.id);
        if (user && isRealString(message.text)) {
            io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
        }
        callback();
    });

    socket.on('user image', (message) => {
        var user = users.getUser(socket.id);
        if (user) {
            io.to(user.room).emit('user image', message, user.name);
        }
    });

    socket.on('createLocationMessage', (coords) => {
        var user = users.getUser(socket.id);
        if (user) {
            io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));
        }
    });

    socket.on('disconnect', () => {
        var user = users.removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('updateUserList', users.getUserList(user.room));
            io.to(user.room).emit('joinAndLeave', `${user.name} has left room`);
        }
    });
});

server.listen(port, () => {
    console.log(`Server is up on ${port}`);
});
