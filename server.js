const express = require('express');
const SocketServer = require('ws').Server;
const WebSocket = require('ws');
const models = require("./models");
const PORT = 3001;

require('dotenv').config()
const eventCreation_newProject = require('./EventCreationHelper.js')
const ProgressBarHelper = require('./ProgressBarHelper.js')

const server = express()
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
//**Need to do server: app to use express. */
const wss = new SocketServer({ server });

//Set force : true to synchronize models with postgres db. 
//This will wipe all the data in database!
models.sequelize.sync({ force: false }).then(() => {
  wss.broadcast = (data) => {
    wss.clients.forEach(function each(client) {
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify(data));
      }
    })
  }

  clientConnected = () => {
    models.task.findAll().then((data) => {
      console.log('All tasks')
      wss.broadcast({ type: 'allTasks', data: data });
    })
  }

  wss.on('connection', (client) => {
    console.log(`connection ${client}`);
    clientConnected();
    client.on('message', (data) => {
      data = JSON.parse(data)
      switch (data.type) {
        // Path: /users/new Method: POST
        case 'auth0-login':
          login(data);
          break;
          // Path: /projects/new Method: POST
          // Path: /users/new Method: POST
          // Path: /tasks/new Method: POST
        case "eventCreation-newProject":
          eventCreation_newProject(data, client);
          break;
          // Path: /tasks/update Method: PUT
        case 'start-time-for-contractor-tasks':
          startTimeForContractorTasks(data);
          clickedStartButton(data, client);
          break;
          // Path: /tasks/update Method: PUT
        case 'end-time-for-contractor-tasks-and-updating-progress-bar':
          endTimeForContractorTasks(data, client);
          clickedEndButton(data, client);
          break;
          // Path: /tasks Method: GET
        case 'request-tasks-and-users':
          sendDonutGraphInfo(data, client);
          break;

        case 'add-contractor-to-progress-bar':
          addContractorToProgressBar(data);
          break;
          // Path: /tasks/project/:projectid Mathod: GET
        case 'askingForNewsfeedUpdate':
          updateNewsfeed(data);
          break;

        case 'end-button-pressed':
          // setDisabledEndButtonState(data, client);
          break;
          // Path: /projects Method: GET
        case 'getProjectListforManager':
          getProjectListforManager(data.email, client);
          break;
          // Path: /tasks/:userid Method: GET
        case 'askingForUserTasks':
          console.log('HELLO')
          getUserTasks(data.email, client)
          break;
          // Path: /tasks Method: GET
        case 'new-pb-state':
          sendDonutGraphInfo(data, client);
          break;

        default:
          throw new Error("Unknown event type " + data.type)
      }
    });

    client.on('close', (event) => {
      console.log('Client disconnected');
    });
  });

});

const login = (data, client) => {
  /* Adds user details to database on login */
  models.user.count({ where: { email: data.email } }).then((count) => {
    if (count > 0) {
      console.log('user exists');
    } else {
      models.user.create({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        avatar: data.picture
      })
    }
  })
}

const updateNewsfeed = (data) => {
  /* Get all tasks for a specific project Id */
  models.task.findAll({
      include: [models.user],
      where: {
        projectId: data.projectId
      }
    })
    .then((allTasks) => {
      // client.send(JSON.stringify({type: 'allTasks', data: allTasks}));
      console.log('updateNewsfeed')
      wss.broadcast({ type: 'allTasks', data: allTasks });
    })
}

const startTimeForContractorTasks = (data) => {
  models.task.update({
      start_time: data.start_time
    }, {
      where: {
        id: data.id
      }
    })
    .then((res) => {
      // console.log(res);
    }).catch((err) => {
      console.error(err);
    })
}

const endTimeForContractorTasks = (data, client) => {
  models.task.update({
      end_time: data.end_time
    }, {
      where: {
        id: data.id
      }
    })
    .then((res) => {
      sendDonutGraphInfo(data, client);
    })
    .catch((err) => {
      console.error(err);
    })
}

const sendDonutGraphInfo = (data, client) => {
  models.task.findAll({ raw: true }).then((tasks) => {
    models.user.findAll({ raw: true }).then((users) => {
      users = users.map((u) => { return { id: u.id, name: u.first_name }; })
      let progress_bar = ProgressBarHelper(tasks, users)

      let message = {
        type: 'update-progress-bar',
        progress_bar: progress_bar
      }
      console.log('updatep rogress_bar')
      wss.broadcast(message);
    })
  })
}

async function getTasksAndUsers(data, client) {
  let tasks = await models.task.findAll()
    .then((res) => {
      return res;
    }).catch((err) => {
      console.error(err);
    })

  let users = await models.user.findAll()
    .then((res) => {
      return res;
    }).catch((err) => {
      console.error(err);
    })

  let message = {
    type: "progress-bar-update",
    tasks: tasks,
    users: users
  }
  client.send(JSON.stringify(message));
}

const getProjectListforManager = (manager_email, client) => {
  /* Returns list of all projects belonging to the passed in email. */
  return models.user.findOne({ where: { email: manager_email } }).then((manager) => {
    models.project.findAll({ where: { userId: +manager.toJSON().id }, raw: true })
      .then((projects) => {
        let message = {
          type: 'update-project-list',
          projects: projects
        }
        client.send(JSON.stringify(message));
      })
  }).catch((err) => {
    console.error(err);
  });
};

const getUserTasks = (email, client) => {
  /* Returns list of all projects belonging to the passed in email. */
  return models.user.findOne({ where: { email: email } }).then((user) => {
    models.task.findAll({ where: { userId: +user.toJSON().id }, raw: true }).then((tasks) => {
      console.log(tasks)
      console.log('lul')
      let message = {
        type: 'task-list-for-user',
        tasks: tasks
      }
      client.send(JSON.stringify(message));
    })
  }).catch((err) => {
    console.error(err);
  });
};

const clickedStartButton = (data, client) => {
  // console.log('clicked start button');

  const message = {
    type: "start-time-button-clicked",
    id: data.id
  }

  wss.broadcast(message);
}

const clickedEndButton = (data, client) => {
  // console.log('clicked end button');

  const message = {
    type: "end-time-button-clicked",
    id: data.id
  }
  console.log('end button clicked')
  wss.broadcast(message);
}

// let progress_bar;

// const updatingProgressBar = (data) => {
//   progress_bar = data.progress_bar;
// }

// const setProgressBarState = (data, client) => {
//   let message = {
//       type: 'set-progress-bar-state',
//       progress_bar: progress_bar
//     }
//     // console.log(message);
//   client.send(JSON.stringify(message));
// }