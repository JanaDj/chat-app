const express = require('express');
const app = express();
const http = require('http').createServer(app);
// const router = express.Router();
const io = require('socket.io')(http);
const port = 3000;
const redis = require('redis');
const redisClient = redis.createClient({ host: 'localhost', port: 6379 });
const redisAdapter = require('socket.io-redis');
io.adapter(redisAdapter({ host: 'localhost', port: 6379 }));
const os = require('os');
const cluster = require('cluster');
const clusterWorkSize = os.cpus().length;

// setting up the multiple cpus 
if (clusterWorkSize > 1) {
  if (cluster.isMaster) {
    for (let i = 0; i < clusterWorkSize; i++) {
      cluster.fork();
    }
    cluster.on('exit', worker => {
      console.log(`Worker ${worker.id} has exited`);
    })
  } else {
    http.listen(port, () => {
      console.log(`Express server listening on port ${port} and worker ${process.pid}`);
      //  clears redis msgs on server start:  (used while testing)
      redisClient.flushall();
    });
  }
} else {
  http.listen(port, () => {
    console.log(`Express server listening on port ${port} with the single worker ${process.pid}`);
    redisClient.flushall();
  });
}

//  handling CORS 
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});
/**
 * Method to wrap the try catch code to reduce repetative code
 * @param {function} cb 
 */
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (err) {
      next(err);
    }
  }
}

//  returns all messages stored in redis
app.get('/messages', asyncHandler(async (req, res) => {
  //get msgs
  let msgs = redisClient.lrange('messages', 0, 99, (err, messageList) => {
    if (!err) {
      let result = [];
      messageList = messageList.reverse();
      for (let msg in messageList) {
        parsedMsg = JSON.parse(messageList[msg]);
        msgText = `${parsedMsg['name']} : ${parsedMsg['message']}`;
        result.push(msgText);
        // console.log(msgText);
      }
      res.send(result).end();
    } 
  })

}));
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
    users[socket.id] = name;
    socket.broadcast.emit('user-connected', name);
  })
  //   new message 
  socket.on('send-chat-message', message => {
    socket.broadcast.emit('chat-message', { message: message, name: users[socket.id] });
    // `${data.name}: ${data.message}`
    console.log(JSON.stringify({ message: message, name: users[socket.id] }));
    redisClient.lpush('messages', JSON.stringify({ message: message, name: users[socket.id] }));
    redisClient.ltrim('messages', 0, 99);  //storing only last 100 messages
  })
  //   user left the chat
  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnected', users[socket.id]);
    delete users[socket.id];
  })
});







