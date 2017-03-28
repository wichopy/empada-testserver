const express = require('express');
const SocketServer = require('ws').Server;
const WebSocket = require('ws');
// const sqlize = require('sequelize');
var models = require("./models");
// Set the port to 4000
const PORT = 3001;

// let data = [
//   ["Washington",
//     new Date(1789, 4, 29),
//     new Date(1797, 3, 3),
//     new Date(1789, 4, 19),
//     new Date(1797, 2, 27)
//   ],
//   ["Ammar",
//     new Date(1798, 4, 19),
//     new Date(1799, 3, 3),
//     new Date(1798, 4, 29),
//     new Date(1799, 3, 4)
//   ],
//   ["Adams",
//     new Date(1797, 3, 3),
//     new Date(1801, 3, 3),
//     new Date(1802, 3, 3),
//     new Date(1804, 3, 3)
//   ]
// ];

// for (data_row of data) {
//   models.task.create({
//     task_name: data_row[0],
//     start_date: data_row[1],
//     end_date: data_row[2],
//     assigned_start_date: data_row[3],
//     assigned_end_date: data_row[4]
//   })
//   .then(() => {
//     console.log("Seed is in the database.")
//   });
// };

// Create a new express server
const server = express()
  // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
//**Need to do server: app to use express. */
const wss = new SocketServer({ server });


clientConnected = () => {
  models.task.findAll({
    attributes: [
      'task_name',
      'start_date',
      'end_date',
      'assigned_start_date',
      'assigned_end_date'
    ]
  })
  .then((data) => {
    console.log("queried tasks from server when client connected");
    wss.broadcast({type:'tasks', data: data});
  })
}


// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.
// or alternatively
// return text.replace(urlRegex, '<a href="$1">$1</a>')
wss.broadcast = (data) => {
  wss.clients.forEach(function each(client) {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

wss.on('connection', (client) => {
  console.log(`connection ${client}`);
  clientConnected();


  client.on('message', function (event) {
    console.log(`I received: ${event}`);
    models.task.create({ task_name: event }).then(() => {
      console.log("stuck it in the database.")
      wss.broadcast(event);
    });
  });

  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  client.on('close', (event) => {
    console.log('Client disconnected')
  });
});