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

// clientConnected = () => {
//   models.task.findAll({
//       attributes: [
//         'task_name',
//         'start_date',
//         'end_date',
//         'assigned_start_date',
//         'assigned_end_date'
//       ]
//     })
//     .then((data) => {
//       console.log("queried tasks from server when client connected");
//       wss.broadcast({ type: 'tasks', data: data });
//     })
// }

wss.broadcast = (data) => {
  wss.clients.forEach(function each(client) {
    if (client.readyState === client.OPEN) {
      console.log("client connected!");
      client.send(JSON.stringify(data));
    }
  });
};

wss.on('connection', (client) => {
  console.log(`connection ${client}`);
  wss.broadcast("New client connected!")
    // clientConnected();

  client.on('message', (data) => {
    data = JSON.parse(data)
    console.log(data);
    // wss.broadcast(event);
    switch (data.type) {
      case 'auth0-login':
        login(data)
        break;
      case "eventCreation-newProject":
        eventCreation_newProject(data.eventCreation);
        break;
      default:
        throw new Error("Unknown event type " + data.type)
    }
  });

  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  client.on('close', (event) => {
    console.log('Client disconnected')
  });
});
eventCreation_newProject = (data) => {
  console.log(data);
  models.project.create({
    name: data.name,
    start_date: data.date,
    description: data.description
  }).then(() => { console.log("Inserted!"); }).catch()
}

login = (data, client) => {
  models.user.count({ where: { email: data.email } }).then((count) => {
    if (count > 0) {
      console.log('user exists');
    } else {
      models.user.create({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email
      })
    }
  })
}

// register = (data, client) => {
//   models.user.findAndCountAll({where: {email: data.email}, limit: 1}).then((result) => {
//     if(result.count > 0){
//       console.log('user already exists')
//     }else{
//       models.user.create({first_name: data.first_name, last_name: data.last_name, email: data.email, password: data.password})
//       console.log('user created');
//     }
//   })
//   // console.log('email' + data.email)
// }