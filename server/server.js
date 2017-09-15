const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log('New user connect.');
    /* 
        socket.emit: sends the message to sender-client only

        io.emit: sendings to all clients, include sender

        io.sockets.emit will send to all the clients

        socket.broadcast.emit will send the message to all the other clients except the newly created connection
    */


    socket.emit('newMessage', {
        from: 'Admin',
        text: 'Welcome to the chat app.',
        createAt: new Date().getTime(),
    });

    socket.broadcast.emit('newMessage', {
        from: 'Admin',
        text: 'New user joined.',
        createAt: new Date().getTime(),
    });


    socket.on('createMessage', (message) => {
        console.log('createMessage', message);
        io.emit('newMessage', {
            from: message.from,
            text: message.text,
            createAt: new Date().getTime(),
        });
        // socket.broadcast.emit('newMessage', {
        //     from: message.from,
        //     text: message.text,
        //     createAt: new Date().getTime(),
        // })
    });

    socket.on('disconnect', () => {
        console.log('User was disconnected.');
    });
});

server.listen(port, () => {
    console.log(`Server is up on ${port}`);
});
