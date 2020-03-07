const socket = io('http://127.0.0.1:3000')
const messageContainer = document.getElementById('chatContainer')
const messageForm = document.getElementById('sendMsgContainer')
const messageInput = document.getElementById('messageInput')

/**
 * GET request to /messages
 * expected response is in json array
 * Each json message is parsed and formated as 'user: message'
 * Once parsed and formated, appendMessage is called to add message to the UI
 * .historyMsg class is passed (this class is used for messages loaded from the message history)
 */
fetch('http://127.0.0.1:3000/messages')
  .then(response => response.json())
  .then(data => {
    data.forEach(msg => {
      const parsedMsg = JSON.parse(msg);
      console.log(parsedMsg);
      const msgText = `${parsedMsg.name} : ${parsedMsg.message}`;
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

/**
 * Socket event that is triggered on 'chat-message'
 * This event is emited when there is a new chat message
 * Append message is called, displaying name of the person that sent the message and message
 * .otherMsg class is passed (this is style for messages sent by other users)
 */
socket.on('chat-message', data => {
  appendMessage(`${data.name}: ${data.message}`, 'otherMsg');
});
/**
 * Socket event that is triggered on 'user-connected'
 * This event is emited if user joins the chat
 * Append message is called, displaying name of the person that connected and .chatInfo class is passed (this is style for event messages in the chat)
 */
socket.on('user-connected', name => {
  appendMessage(`${name} connected`, 'chatInfo');
});

/**
 * Socket event that is triggered on 'user-disconnected'
 * This event is emited if user leaves the chat
 * Append message is called, displaying name of the person that disconnected and .chatInfo class is passed to the function
 */
socket.on('user-disconnected', name => {
  appendMessage(`${name} disconnected`, 'chatInfo');
});

/**
 * form element event listner for submit action (send message form)
 * page refresh is disabled, new message is appended in view and new message event is emited
 */
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
function appendMessage (message, className) {
  const messageElement = document.createElement('div');
  messageElement.classList.add(className);
  messageElement.innerText = message;
  messageContainer.append(messageElement);
  // scroll container div to the bottom once new message is added to the div
  messageContainer.scrollTop = messageContainer.scrollHeight;
}
