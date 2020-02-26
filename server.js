const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const port = 3000;
const redis = require('redis');
const redisClient = redis.createClient({host: 'localhost', port: 6379})
const redisAdapter = require('socket.io-redis');
io.adapter(redisAdapter({host: 'localhost', port: 6379})); 
const os = require('os');
const cluster = require('cluster');
const clusterWorkSize = os.cpus().length;

// setting up the multiple cpus 
if (clusterWorkSize > 1){
  if(cluster.isMaster) {
    for (let i = 0; i < clusterWorkSize; i++) {
      cluster.fork();
    }
    cluster.on('exit', worker => {
      console.log(`Worker ${worker.id} has exited`);
    })
  } else {
    http.listen(port, () => {
      console.log(`Express server listening on port ${port} and worker ${process.pid}`);
    });
  }
} else {
    http.listen(port, () => {
      console.log(`Express server listening on port ${port} with the single worker ${process.pid}`);
    });
}
// storing connected users
const users = {};

// redis
redisClient.on('ready', () => {
  console.log("Redis is ready");
});

redisClient.on('error', () => {
  console.log("Error in Redis"); 
});
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






