const express = require('express');
const SocketServer = require('ws').Server;
const WebSocket = require('ws');
// const sqlize = require('sequelize');
var models = require("./models");
// Set the port to 4000
const PORT = 3001;

// Create a new express server
const server = express()
  // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
//**Need to do server: app to use express. */
const wss = new SocketServer({ server });

// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.
// or alternatively
// return text.replace(urlRegex, '<a href="$1">$1</a>')
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    client.send(data);
  });
};

wss.on('connection', (client) => {
  console.log(`connection ${client}`);

  client.on('message', handleMessage);

  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  client.on('close', (event) => {
    console.log('Client disconnected')
  });
});

function handleMessage(data){
  data = JSON.parse(data)
  switch(data.type){
    case 'login':
      login(data)
      break;
    case 'register':
      register(data)
    default:
      throw new Error("Unknown event type " + data.type)
  } 
}

function login(data){
  models.user.findAll().then((users) => {
    console.log(users)
  })
}

function register(data){
  models.user.findAll().then((users) => {
    console.log(users)
  })
}