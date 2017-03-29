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
console.log('wait for db model sync');

models.sequelize.sync({ force: true })

console.log('db now synced with models.')
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
      // wss.broadcast(event);
    switch (data.type) {
      case 'auth0-login':
        login(data)
        break;
      case "eventCreation-newProject":
        eventCreation_newProject(data.eventCreation)
        console.log("finished adding project!!")
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
async function eventCreation_newProject(data) {
  var add_users = data.assigned_people.map((p) => {
    return { first_name: p.name, email: p.email };
  });
  var add_tasks = data.tasks.map((t) => {
    return {
      assigned_start_time: new Date(`${data.date}T${t.assigned_start_time}`),
      assigned_end_time: new Date(`${data.date}T${t.assigned_end_time}`),
      name: t.name,
      description: t.description,
    };
  });
  var add_project = {
    name: data.name,
    start_date: new Date(data.date),
    end_date: new Date(data.date),
    description: data.description
  };
  await models.user.bulkCreate(add_users)
  console.log('between user create and task create')
  await models.task.bulkCreate(add_tasks)
  console.log('between task create and project create')
  await models.project.create(add_project)
  console.log('done all inserts')
  await models.task
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