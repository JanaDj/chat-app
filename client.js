const socket = io('http://127.0.0.1:3000')
const messageContainer = document.getElementById('chatContainer')
const messageForm = document.getElementById('sendMsgContainer')
const messageInput = document.getElementById('messageInput')

// load previous messages:
const getUrl = 'http://127.0.0.1:3000/messages';
var xmlHttp = new XMLHttpRequest();
xmlHttp.onreadystatechange = function () {
  if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
    console.log(xmlHttp.responseText);
        let msgs = xmlHttp.responseText;
        msgs = msgs.replace('[', '');
        msgs = msgs.replace(/\"/g, '');
        msgs = msgs.replace(']', '');
        let values = msgs.split(',');
        values.forEach(msg => {
          if(msg){    // to avoid displaying empty message bubbles
      appendMessage(msg, 'historyMsg');
          }
    });
  }
}
xmlHttp.open("GET", getUrl, true); // true for asynchronous 
xmlHttp.send(null);







const href = window.location.href;
const url = new URL(href);
const name = url.searchParams.get('nameInput');
appendMessage('You joined', 'chatInfo');
socket.emit('new-user', name);

socket.on('chat-message', data => {
  appendMessage(`${data.name}: ${data.message}`, 'otherMsg');
})

socket.on('user-connected', name => {
  appendMessage(`${name} connected`, 'chatInfo');
})

socket.on('user-disconnected', name => {
  appendMessage(`${name} disconnected`, 'chatInfo');
})

messageForm.addEventListener('submit', e => {
  e.preventDefault();
  const message = messageInput.value;
  appendMessage(`You: ${message}`, 'ownMsg');
  socket.emit('send-chat-message', message);
  messageInput.value = '';
})

function appendMessage(message, className) {
  const messageElement = document.createElement('div');
  messageElement.classList.add(className);
  messageElement.innerText = message;
  messageContainer.append(messageElement);

  //scroll div to the bottom:
  messageContainer.scrollTop = messageContainer.scrollHeight;
}