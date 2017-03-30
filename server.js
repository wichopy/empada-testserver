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

// models.sequelize.sync({ force: true })
models.sequelize.sync();

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
    // models.task.findAll({ raw: true }).then((res) => { console.log(res); });
  client.on('message', (data) => {
    data = JSON.parse(data)
    console.log(data);
    // wss.broadcast(event);
    switch (data.type) {
      case 'auth0-login':
        login(data)
        break;
      case "eventCreation-newProject":
        eventCreation_newProject(data)
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
  function show_object_methods(o) {
    for (let m in o) { console.log(m) };
  }
  var manager_email = data.profile.email;
  const event_manager = await models.user.findOne({ where: { email: manager_email } });
  data = data.eventCreation

  const add_project = {
    name: data.name,
    start_date: new Date(data.startDate),
    end_date: new Date(data.endDate),
    description: data.description,
  };
  const add_users = await data.assigned_people.map((ap) => {
    return { first_name: ap.name, email: ap.email }
  });
  const add_tasks = data.tasks.map((t) => {
    return {
      assigned_start_time: new Date(`${data.startDate}T${t.assigned_start_time}`),
      assigned_end_time: new Date(`${data.startDate}T${t.assigned_end_time}`),
      name: t.name,
      description: t.description,
      userId: t.user_id
    };
  });

  const [project, new_users] = await Promise.all([
    models.project.create(add_project),
    models.user.bulkCreate(add_users, { individualHooks: true, returning: true }),
  ]);
  await project.setUser(event_manager);
  for (const user of new_users) {
    user.addProject(project);
  }

  user_id_mapping = {};

  for (var ou of data.assigned_people) {
    user_id_mapping[ou.email] = {};
    user_id_mapping[ou.email].old_id = ou.id;
  }
  for (var nu of new_users) {
    user_id_mapping[nu.toJSON().email].new_id = nu.toJSON().id;
  }
  // console.log(user_id_mapping);
  // console.log(add_tasks);
  let remapped_task_user_ids = add_tasks.map((t) => {
      for (var u in user_id_mapping) {
        if (user_id_mapping[u].old_id == t.userId) {
          // console.log(user_id_mapping[u].old_id)
          // console.log(t.userId);
          t.userId = user_id_mapping[u].new_id

        }
        t.projectId = project.toJSON().id
      }
      return t;
    })
    // console.log(remapped_task_user_ids)
  console.log('=------------------start insert of tasks');
  let new_tasks = await models.task.bulkCreate(remapped_task_user_ids, { individualHooks: true, returning: true });
  console.log('=-----------finished inserting tasks');
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