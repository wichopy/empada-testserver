const express = require('express');
const SocketServer = require('ws').Server;
const WebSocket = require('ws');
// const sqlize = require('sequelize');
var models = require("./models");
// Set the port to 4000
const PORT = 4000;

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
  wss.broadcast("New client connected!")

  client.on('message', (event) => {
    console.log(`I received: ${event}`);
    var newMessage = JSON.parse(event);
    switch (newMessage.type) {
      case "eventCreation-addNewAssignedPerson":
        eventCreation_addNewAssignedPerson(newMessage.data)
        break;
      case "eventCreation-newProject":
        eventCreation_newProject(newMessage.data);
        break;
      default:
        break;
    };
  });
  //Functions for switch case:
  {
    "eventCreation": {
      "selected": { "name": "Sally", "id": "3" },
      "date": "1997-12-03",
      "name": "Wedding",
      "description": "sadfsaf",
      "newTask": "",
      "newDescription": "",
      "newStartTime": "",
      "newEndTime": "",
      "newAssignedPerson": "",
      "newAssignedEmail": "",
      "assigned_people": [{ "name": "Jimmy", "id": 1, "email": "jimmy@email.com" }, { "name": "Johnny", "id": 2, "email": "Johnny@email.com" }, { "name": "Sally", "id": 3, "email": "sally@email.com" }, { "name": "asfd", "id": 4, "email": "sdfsaf" }],
      "tasks": [{ "id": 1, "user_id": "3", "name": "asdf", "description": "sf", "assigned_start_time": "12:03", "assigned_end_time": "17:00" }],
      "timelineData": [
        ["Sally", "2017-03-27T12:03:00.000Z", "2017-03-27T17:00:00.000Z"]
      ]
    },
    "type": "eventCreation-newProject"
  }

  eventCreation_newProject = (data) => {
    models.project.create({ name: data.name })
  }
  eventCreation_addNewAssignedPerson = (data) => {
      models.user.create({
        first_name: data.name,
        email: data.email
      }).then(() => {
        console.log(`Add ${data.name} to users`);
        wss.broadcast(JSON.stringify(data.name));
      });
    }
    // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  client.on('close', (event) => {
    console.log('Client disconnected')
  });
});