const express = require('express');
const SocketServer = require('ws').Server;
const WebSocket = require('ws');
// const sqlize = require('sequelize');
const models = require("./models");
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
//     name: data_row[0],
//     start_time: data_row[1],
//     end_time: data_row[2],
//     assigned_start_time: data_row[3],
//     assigned_end_time: data_row[4]
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

models.sequelize.sync({ force: false }).then(() => {
  clientConnected = () => {
    models.task.findAll({
      attributes: [
        'name',
        'start_time',
        'end_time',
        'assigned_start_time',
        'assigned_end_time'
      ]
      // where: {
      //   project_id: data.project_id,
      // }
      })
      .then((data) => {
        console.log("queried tasks from server when client connected");
        // client.send(JSON.stringify({type: 'allTasks', data: data.data}));
        wss.broadcast({ type: 'allTasks', data: data });
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

    client.on('message', (data) => {
      data = JSON.parse(data)
        // wss.broadcast(event);
      switch (data.type) {
        case 'auth0-login':
          login(data)
          break;

        case 'start-time-for-contractor-tasks':
          startTimeForContractorTasks(data);
          break;

        case 'end-time-for-contractor-tasks-and-updating-progress-bar':
          console.log('end-time-for-contractor-tasks-and-updating-progress-bar')
          endTimeForContractorTasks(data);
          sendDonutGraphInfo(data);
          break;

        case 'add-contractor-to-progress-bar':
          addContractorToProgressBar(data);
          break;

        case 'askingForNewsfeedUpdate':
          updateNewsfeed(data);
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

  const login = (data, client) => {
    models.user.count({ where: { email: data.email } }).then((count) => {
      if (count > 0) {
        console.log('user exists');
      } else {
        models.user.create({ first_name: data.first_name, last_name: data.last_name, email: data.email })
      }
    })
  }

  const updateNewsfeed = (data) => {
    models.task.findAll({
      attributes: [
        // 'user_id',
        'name',
        'start_time',
        'end_time',
        'assigned_start_time',
        'assigned_end_time'
      ]
      // where: {
      //   project_id: data.project_id,
      // }
    })
    .then( (allTasks) => {
      // client.send(JSON.stringify({type: 'allTasks', data: allTasks}));
      wss.broadcast({ type: 'allTasks', data: allTasks });

    //   return (model.notification.findAll(
    //     {attributes: [
    //       'title',
    //       'description',
    //       'type',
    //       'time'
    //     ],
    //     where: {
    //       project_id: data.project_id
    //     }
    //   }))
    // })
    // .then( (user_logs) => {
    //   client.send(JSON.stringify(newsfeed));
    })
  }

  const startTimeForContractorTasks = (receivedMessage) => {
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

  const endTimeForContractorTasks = (receivedMessage) => {
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

  const sendDonutGraphInfo = (receivedMessage) => {
    let message = {
      type: 'update-progress-bar',
      progress_bar: receivedMessage.progress_bar
    }
    client.send(JSON.stringify(message));
  }
})
