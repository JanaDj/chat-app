const socket = io('http://127.0.0.1:3000')
const messageContainer = document.getElementById('chatContainer')
const messageForm = document.getElementById('sendMsgContainer')
const messageInput = document.getElementById('messageInput')

// load previous messages:
fetch('http://127.0.0.1:3000/messages')
  .then(response => response.json())
  .then(data => {
    console.log(typeof data);
    console.log(data);
    data.forEach(msg => {
      parsedMsg = JSON.parse(msg);
      console.log(parsedMsg);
      msgText = `${parsedMsg['name']} : ${parsedMsg['message']}`;
      appendMessage(msgText, 'historyMsg');
    });
  });

// get username from the url 
const href = window.location.href;
const url = new URL(href);
const name = url.searchParams.get('nameInput');
// display message about user connecting
appendMessage('You joined', 'chatInfo');
socket.emit('new-user', name);

// new chat message received
socket.on('chat-message', data => {
  appendMessage(`${data.name}: ${data.message}`, 'otherMsg');
});
// new user connected to the chat
socket.on('user-connected', name => {
  appendMessage(`${name} connected`, 'chatInfo');
});

// user has left the chat
socket.on('user-disconnected', name => {
  appendMessage(`${name} disconnected`, 'chatInfo');
});

// form element event listner for submit action (send message form)
// page refresh is disabled, new message is appended in view and new message event is emited
messageForm.addEventListener('submit', e => {
  e.preventDefault();
  const message = messageInput.value;
  appendMessage(`You: ${message}`, 'ownMsg');
  socket.emit('send-chat-message', message);
  messageInput.value = '';
});
/**
 * Function to display message on the screen
 * Function creates a new div inside the chatContainer and adds passed class to the div
 * @param {string} message , text of the message to be displayed 
 * @param {string} className , css class for the message div
 */
function appendMessage(message, className) {
  const messageElement = document.createElement('div');
  messageElement.classList.add(className);
  messageElement.innerText = message;
  messageContainer.append(messageElement);
  //scroll container div to the bottom once new message is added to the div
  messageContainer.scrollTop = messageContainer.scrollHeight;
}