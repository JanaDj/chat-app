const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const port = 3000;

// storing connected users
const users = {};

// socket events handled here 
io.on('connection', socket => {
  console.log('user is connected');
    // new user joined
    socket.on('new-user', name => {
        users[socket.id] = name
        socket.broadcast.emit('user-connected', name)
      })
    //   new message 
      socket.on('send-chat-message', message => {
        socket.broadcast.emit('chat-message', { message: message, name: users[socket.id] })
      })
    //   user left the chat
      socket.on('disconnect', () => {
        socket.broadcast.emit('user-disconnected', users[socket.id])
        delete users[socket.id]
      })
});
// start server
http.listen(port, () => {
    console.log(`Server started on port: ${port}`);
});






