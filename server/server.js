const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const redisURL = process.env.REDIS_URL || { host: 'localhost', port: 6379 }; // I was test hosting the app on Heroku so url is adapted for that
// setting up redis
const redis = require('redis');
const redisClient = redis.createClient(redisURL);
// adapter for multiple processes
const redisAdapter = require('socket.io-redis');
io.adapter(redisAdapter(redisURL));

/**
 * Function to set headers to avoid CORS policy errors
 */
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});
/**
* Function to wrap the try catch code to reduce repetative code
* @param {function} cb, callback function to be wrapped in the tryCatch code
*/
function asyncHandler (cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (err) {
      next(err);
    }
  }
}

/**
 * Function that handles the GET request for /messages
 * function retrieves messages from redis and sends them in the response
 */
app.get('/messages', asyncHandler(async (req, res) => {
  // get msgs
  redisClient.lrange('messages', 0, 99, (err, messageList) => {
    if (!err) {
      const result = [];
      messageList = messageList.reverse();
      for (const msg in messageList) {
        result.push(messageList[msg]);
      }
      res.send(result).end();
    }
  });
}));
// storing connected users
const users = {};

// redis events
/**
 * Redis client event that gets triggered on 'ready' state
 * Message about ready state is printed to the console
 */
redisClient.on('ready', () => {
  console.log('Redis is ready');
});
/**
 * Redis client event that gets triggered if redis encounters error
 * Message about encountering error is printed to the console
 */
redisClient.on('error', () => {
  console.log('Error in Redis');
});

// socket events
/**
 * io event triggered upon connection
 */
io.on('connection', socket => {
  console.log('user is connected');
  // new user joined
  /**
   * socket event that is triggered if new user joins
   * 'user-connected' event gets broadcast emited to all other users (user that joined and triggered event doesn't get the user-connected event)
   */
  socket.on('new-user', name => {
    users[socket.id] = name;
    socket.broadcast.emit('user-connected', name);
  });
  /**
   * socket event that gets triggered on 'send-chat-message'
   * this event will broadcast emit the new 'chat-message' event and pass message information. This event gets sent to all other users but not the user sending the message
   * redis is also updated with the new message so message history is up to date
   * message history in redis is trimed so it only stores last 100 messages
   */
  socket.on('send-chat-message', message => {
    socket.broadcast.emit('chat-message', { message: message, name: users[socket.id] });
    redisClient.lpush('messages', JSON.stringify({ message: message, name: users[socket.id] }));
    redisClient.ltrim('messages', 0, 99); // storing only last 100 messages
  })
  /**
   * socket event that gets triggered on 'disconnect'
   * this event will broadcast emit the new 'user-disconnected' event and pass over id of the disconnected user socket to all other users
   * user will also be removed from the list of users
   */
  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnected', users[socket.id]);
    delete users[socket.id];
  })
});
/**
 * server gets started on the defined port
 * when server is started, we are also clearing redisClient data, so chat history gets deleted as well
 */
http.listen(port, () => {
  console.log(`Express server listening on port ${port} and worker ${process.pid}`);
  // clears redis msgs on server start:  (used while testing)
  redisClient.flushall();
});
