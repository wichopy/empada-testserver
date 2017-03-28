const express = require('express');
const SocketServer = require('ws').Server;
const WebSocket = require('ws');
// const sqlize = require('sequelize');
const models = require("./models");
// Set the port to 4000
const PORT = 3001;

// Create a new express server
const server = express()
  // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`)
);

// server.get("/project/:project_id/user/:user_id", (req, res) => {
//   res.status(200).render("urls_register", templateVars);
// });


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

  client.on('message', (data) => {
    let receivedMessage = JSON.parse(data);
    console.log('before switch')
    switch (receivedMessage.type) {
      case 'start-time-for-contractor-tasks':
        startTimeForContractorTasks(receivedMessage);
      break;

      case 'end-time-for-contractor-tasks-and-updating-progress-bar':
        console.log('end-time-for-contractor-tasks-and-updating-progress-bar')
        endTimeForContractorTasks(receivedMessage);
        let message = {
          type: 'update-progress-bar',
          progress_bar: receivedMessage.progress_bar
        }
        client.send(JSON.stringify(message));
      break;

      case 'add-contractor-to-progress-bar':
        addContractorToProgressBar(receivedMessage);
      break;

      default:
        console.error('Failed to send back');
    }
  })

  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  client.on('close', (event) => {
    console.log('Client disconnected')
  });
});


function startTimeForContractorTasks(receivedMessage) {
  models.task.update({
    start_time: receivedMessage.start_time
    }, {
      where: {
        project_id: receivedMessage.project_id,
        id: receivedMessage.id
        }
      }).then((res) => {
        console.log(res);
      })
}

function endTimeForContractorTasks(receivedMessage) {
  console.log('endTimeForContractorTasks');
  models.task.update({
    end_time: receivedMessage.end_time
    }, {
      where: {
        project_id: receivedMessage.project_id,
        id: receivedMessage.id
        }
      }).then((res) => {
        console.log(res);
      })
}

// function addContractorToProgressBar(receivedMessage) {
//   let message = {
//     type: receivedMessage.type,
//     name: receivedMessage.name, 
//     completed_tasks: receivedMessage.completed_tasks, 
//     incomplete_tasks: receivedMessage.incomplete_tasks
//   }
//   client.send(JSON.stringify(message));
//   break; 
// }
