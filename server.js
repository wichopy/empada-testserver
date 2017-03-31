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
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
//**Need to do server: app to use express. */
const wss = new SocketServer({ server });

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
  })
}
models.sequelize.sync().then(() => {
  clientConnected = () => {
      models.task.findAll(
          // {
          // attributes: [
          //   'name',
          //   'start_date',
          //   'end_date',
          //   'assigned_start_date',
          //   'assigned_end_date'
          // ]
          // }
        )
        .then((data) => {
          console.log("queried tasks from server when client connected");
          wss.broadcast({ type: 'tasks', data: data });
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
        case "eventCreation-newProject":
          eventCreation_newProject(data)
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
        default:
          throw new Error("Unknown event type " + data.type)
      }
    });
    // Set up a callback for when a client closes the socket. This usually means they closed their browser.
    client.on('close', (event) => {
      console.log('Client disconnected')
    });
  });

});

login = (data, client) => {
  models.user.count({ where: { email: data.email } }).then((count) => {
    if (count > 0) {
      console.log('user exists');
    } else {
      models.user.create({ first_name: data.first_name, last_name: data.last_name, email: data.email })
    }
  })
}

function sendDonutGraphInfo(receivedMessage) {
  let message = {
    type: 'update-progress-bar',
    progress_bar: receivedMessage.progress_bar

  }
  client.send(JSON.stringify(message));
}

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

async function eventCreation_newProject(data) {
  /*
  Creates a new event following this flow:
  1. find event manager from logged in email.
  2. Insert a new project and new users.
  3. assign this project to this event manager.
  4. assign new users this project.
  5. map front end user id's to newly created user ids.
  6. assign tasks the newly inserted user id's and project id.
  7. insert taks.
  */
  function show_object_methods(o) {
    for (let m in o) { console.log(m) };
  }
  const manager_email = data.profile.email;
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
  //assign manager to project.
  await project.setUser(event_manager);

  //assign project to user.
  for (const user of new_users) {
    user.addProject(project);
  }

  //map front end user id's to inserted user id's
  user_id_mapping = {};
  for (const ou of data.assigned_people) {
    user_id_mapping[ou.email] = {};
    user_id_mapping[ou.email].old_id = ou.id;
  }
  for (const nu of new_users) {
    user_id_mapping[nu.toJSON().email].new_id = nu.toJSON().id;
  }
  let remapped_task_user_ids = add_tasks.map((t) => {
    for (const u in user_id_mapping) {
      if (user_id_mapping[u].old_id == t.userId) {
        t.userId = user_id_mapping[u].new_id
      }
    }
    t.projectId = project.toJSON().id
    return t;
  })
  let new_tasks = await models.task.bulkCreate(remapped_task_user_ids, { individualHooks: true, returning: true });
}