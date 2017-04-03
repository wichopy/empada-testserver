const express = require('express');
const SocketServer = require('ws').Server;
const WebSocket = require('ws');
// const sqlize = require('sequelize');
const models = require("./models");
// Set the port to 4000
const PORT = 3001;
require('dotenv').config()
const mailgun_api_key = process.env.api_key;
const domain = process.env.domain;
const mailgun = require('mailgun-js')({ apiKey: mailgun_api_key, domain: domain });
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

console.log('before sync');

models.sequelize.sync({ force: false }).then(() => {
  console.log('after sync');
  clientConnected = () => {
    models.task.findAll( //{
        //   attributes: [
        //     'name',
        //     'start_time',
        //     'end_time',
        //     'assigned_start_time',
        //     'assigned_end_time'
        //   ]
        //   // where: {
        //   //   project_id: data.project_id,
        //   // }
        //}
      )
      .then((data) => {
        console.log("queried tasks from server when client connected");
        // client.send(JSON.stringify({type: 'allTasks', data: data.data}));
        wss.broadcast({ type: 'allTasks', data: data });
      })
  }


  console.log('db now synced with models.')
  wss.broadcast = (data) => {
    wss.clients.forEach(function each(client) {
      if (client.readyState === client.OPEN) {
        console.log("client connected!");
        client.send(JSON.stringify(data));
      }
    })
  }

  wss.on('connection', (client) => {
    console.log(`connection ${client}`);
    clientConnected();
    client.on('message', (data) => {
      data = JSON.parse(data)
        // wss.broadcast(event);
        // debugger;
      switch (data.type) {
        case 'auth0-login':
          login(data)
          break;

        case "eventCreation-newProject":
          eventCreation_newProject(data, client);
          break;

        case 'start-time-for-contractor-tasks':
          startTimeForContractorTasks(data);
          clickedStartButton(data, client);
          updatingProgressBar(data);
          break;

        case 'end-time-for-contractor-tasks-and-updating-progress-bar':
          endTimeForContractorTasks(data);
          sendDonutGraphInfo(data, client);
          clickedEndButton(data, client);
          updatingProgressBar(data);
          break;

        case 'request-tasks-and-users':
          getTasksAndUsers(data, client);
          break;

        case 'request-tasks':
          getTasks(data, client);
          break;

        case 'add-contractor-to-progress-bar':
          addContractorToProgressBar(data);
          break;

        case 'askingForNewsfeedUpdate':
          // updateNewsfeed(data);
          break;

        case 'server-state-store':
          setProgressBarState(data, client);
          break;

        case 'counter':
          counter(data, client);
          break;

        case 'getProjectListforManager':
          getProjectListforManager(data.email);
          break;

        default:
          throw new Error("Unknown event type " + data.type)
      }
    });
    // Set up a callback for when a client closes the socket. This usually means they closed their browser.
    client.on('close', (event) => {
      console.log('Client disconnected');
    });
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
      //   attributes: [
      //     // 'user_id',
      //     'name',
      //     'start_time',
      //     'end_time',
      //     'assigned_start_time',
      //     'assigned_end_time'
      //   ]
      // where: {
      //   project_id: data.project_id,
      // },
      include: [models.user]
    })
    .then((allTasks) => {
      // client.send(JSON.stringify({type: 'allTasks', data: allTasks}));
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

const endTimeForContractorTasks = (data) => {
  console.log('endTimeForContractorTasks');
  models.task.update({
      end_time: data.end_time
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

const sendDonutGraphInfo = (data, client) => {
  let message = {
    type: 'update-progress-bar',
    progress_bar: data.progress_bar
  }
  client.send(JSON.stringify(message));
}

async function getTasksAndUsers(data, client) {
  console.log('entered getTasksAndUsers');
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
    // console.log(message);
  client.send(JSON.stringify(message));
}

// <<<<<<< HEAD
// async function eventCreation_newProject(data, client) {
// =======
// function show_object_methods(o) {
//   /* loop through a sequelize object and display all available methods.*/
//   for (let m in o) { console.log(m) };
// }

const getProjectListforManager = (manager_email) => {
  /* Returns list of all projects belonging to the passed in email. */
  return models.user.findOne({ where: { email: manager_email } }).then((manager) => {
    models.project.findAll({ where: { userId: +manager.toJSON().id }, raw: true }).then((projects) => {
      console.log(projects)
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

  const manager_email = data.profile.email;
  const event_manager = await models.user.findOne({ where: { email: manager_email } });
  data = data.eventCreation;

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
      assigned_start_time: new Date(new Date(`${data.startDate}T${t.assigned_start_time}`).getTime() + 4 * 60 * 60 * 1000),
      assigned_end_time: new Date(new Date(`${data.startDate}T${t.assigned_end_time}`).getTime() + 4 * 60 * 60 * 1000),
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

  client.send(JSON.stringify({ type: 'update-progress-bar-with-new-field' }));
}

async function getTasks(data, client) {
  console.log('entered getTasks');
  let tasks = await models.task.findAll()
    .then((res) => {
      return res;
    })

  let message = {
    type: "update-list-of-tasks",
    tasks: tasks
  };

  // console.log(message);
  client.send(JSON.stringify(message));
}


async function emailTasks(project_id) {
  /* Given a project ID generate a list of tasks for each assigned user's email and send using mailgun. */
  // { where: { projectId: project_id } }
  let project_details = await models.project.findOne({ where: { id: project_id }, raw: true }).then((data) => data);
  console.log('found project');
  let emails = await models.task.findAll({ where: { projectId: project_id } }).then((tasks) => {
    // show_object_methods(projTasks[0])
    const email_list = [];
    tasks.forEach((t) => {
        // show_object_methods(t)
        email_list.push(t.getUser().then((u) => {
          console.log('inside promise, finding email:');
          console.log(u.toJSON().email);
          return u.toJSON().email
            // forEach((task) => {
            //   task.getUser().then((res) => {
            //     const current_Email = res.toJSON().email;
            //   })
        }))
      }) // Promise.all(email_tasks).then((res) => res.forEach((t) => console.log(t.toJSON())))
    return Promise.all(email_list).then((res) => {
      return res
    })
  })

  Array.prototype.contains = function (v) {
    for (var i = 0; i < this.length; i++) {
      if (this[i] === v) return true;
    }
    return false;
  };

  Array.prototype.unique = function () {
    var arr = [];
    for (var i = 0; i < this.length; i++) {
      if (!arr.contains(this[i])) {
        arr.push(this[i]);
      }
    }
    return arr;
  }
  console.log(`Promise all finished, output: ${emails.unique()}`)
  project_details = project_details;
  emails = emails.unique()
  console.log(project_details)
  emails.forEach((user_email) => {
    var data = {
      from: 'Empada Server <noreply@empada.bz>',
      to: user_email,
      subject: `You were invited to ${project_details.name}`,
      text: `You have been assigned to project: ${project_details.name}
                Project description: ${project_details.description}
                Hit this link to go to your task list: http://something.com`
    };

    mailgun.messages().send(data, function (error, body) {
      console.log(body);
    });
  })
}

const clickedStartButton = (data, client) => {
  console.log('clicked start button');

  const message = {
    type: "start-time-button-clicked",
    id: data.id
  }

  client.send(JSON.stringify(message));
}

const clickedEndButton = (data, client) => {
  console.log('clicked end button');

  const message = {
    type: "end-time-button-clicked",
    id: data.id
  }
  client.send(JSON.stringify(message));
}

let progress_bar;

const updatingProgressBar = (data) => {
  progress_bar = data.progress_bar;
}

const setProgressBarState = (data, client) => {
  let message = {
      type: 'set-progress-bar-state',
      progress_bar: progress_bar
    }
  console.log(message);
  client.send(JSON.stringify(message));
}

let tracker = [];

const counter = (data, client) => {
  tracker.push(1);
  let message = {
    type: 'counter', 
    tracker: tracker
  }
  console.log('traaaaaaaaaaaaacker', tracker)
  client.send(JSON.stringify(message));
}

console.log(progress_bar); 

