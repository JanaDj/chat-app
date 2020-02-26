const socket = io('http://127.0.0.1:3000')
const messageContainer = document.getElementById('chatContainer')
const messageForm = document.getElementById('sendMsgContainer')
const messageInput = document.getElementById('messageInput')

const href = window.location.href;
const url = new URL(href);
const name = url.searchParams.get('nameInput');
console.log(name);
appendMessage('You joined', 'chatInfo')
socket.emit('new-user', name)

socket.on('chat-message', data => {
  appendMessage(`${data.name}: ${data.message}`, 'otherMsg');
})

socket.on('user-connected', name => {
  appendMessage(`${name} connected`, 'chatInfo')
})

socket.on('user-disconnected', name => {
  appendMessage(`${name} disconnected`, 'chatInfo')
})

messageForm.addEventListener('submit', e => {
  e.preventDefault();
  const message = messageInput.value
  appendMessage(`You: ${message}`, 'ownMsg')
  socket.emit('send-chat-message', message)
  messageInput.value = ''
})

function appendMessage(message, className) {
  const messageElement = document.createElement('div');
  messageElement.classList.add(className);
  messageElement.innerText = message
  messageContainer.append(messageElement)
}