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
const data = {
  eventCreation: {
    selected: { name: 'Johnny', id: '2' },
    startDate: '2017-12-12',
    endDate: '2017-12-12',
    name: 'Hello',
    description: 'Yes',
    newTask: '',
    newDescription: '',
    newStartTime: '',
    newEndTime: '',
    newAssignedPerson: '',
    newAssignedEmail: '',
    assigned_people: [
      { email: "will@lhl.com", id: 1, name: 'will' },
      { email: "bran@lhl.com", id: 1, name: 'bran' },
      { email: "bern@lhl.com", id: 1, name: 'bern' },
      { email: "ammar@lhl.com", id: 1, name: 'ammar' },
    ],
    tasks: [{
        assigned_start_time: "15:00",
        assigned_end_time: "17:00",
        descrption: "i love you",
        id: 1,
        name: 'the best name',
        user_id: 1
      },
      {
        assigned_start_time: "01:00",
        assigned_end_time: "05:00",
        descrption: "task 2",
        id: 2,
        name: 'the task number two',
        user_id: 2
      },
    ],
    timelineData: [
      [Object],
      [Object]
    ]
  },
  tasks: [],
  modalIsOpen: false,
  grace_period: 300000,
  newsfeed: [{
      type: 'li',
      key: null,
      ref: null,
      props: [Object],
      _owner: null,
      _store: {}
    },
    {
      type: 'li',
      key: null,
      ref: null,
      props: [Object],
      _owner: null,
      _store: {}
    },
    {
      type: 'li',
      key: null,
      ref: null,
      props: [Object],
      _owner: null,
      _store: {}
    },
    {
      type: 'li',
      key: null,
      ref: null,
      props: [Object],
      _owner: null,
      _store: {}
    },
    {
      type: 'li',
      key: null,
      ref: null,
      props: [Object],
      _owner: null,
      _store: {}
    },
    {
      type: 'li',
      key: null,
      ref: null,
      props: [Object],
      _owner: null,
      _store: {}
    },
    {
      type: 'li',
      key: null,
      ref: null,
      props: [Object],
      _owner: null,
      _store: {}
    }
  ],
  list_of_tasks: [{
      start_time: 1490893623563,
      assigned_start_time: '1:07:03 PM',
      description: 'description',
      assigned_end_time: '1:07:03 PM',
      end_time: 1490893623564,
      id: 1,
      user_id: 1
    },
    {
      start_time: 1490893623564,
      assigned_start_time: '1:07:03 PM',
      description: 'another description',
      assigned_end_time: '1:07:03 PM',
      end_time: 1490893623564,
      id: 2,
      user_id: 1
    },
    {
      start_time: 1490893623564,
      assigned_start_time: '1:07:03 PM',
      description: 'a third description',
      assigned_end_time: '1:07:03 PM',
      end_time: 1490893623564,
      id: 3,
      user_id: 2
    }
  ],
  progress_bar: [{ user_id: 1, incomplete_tasks: 100, completed_tasks: 0 },
    { user_id: 2, incomplete_tasks: 100, completed_tasks: 0 }
  ],
  profile: {
    email: 'w.chou06@gmail.com',
    email_verified: true,
    name: 'William Chou',
    given_name: 'William',
    family_name: 'Chou',
    picture: 'https://lh3.googleusercontent.com/-W-gTcGV7dbc/AAAAAAAAAAI/AAAAAAAAAMI/7Se5sPnOO3o/photo.jpg',
    gender: 'male',
    locale: 'en',
    clientID: 'TejTiGWUQtFqn8hCNABYJ1KREwuDwyat',
    updated_at: '2017-03-29T22:30:08.087Z',
    user_id: 'google-oauth2|109368986717559485761',
    nickname: 'w.chou06',
    identities: [
      [Object]
    ],
    created_at: '2017-03-29T18:29:38.017Z',
    global_client_id: '4e3UBnAVcDUPWqHEWb2udw3qCO8qXsmk'
  },
  type: 'eventCreation-newProject'
}
eventCreation_newProject(data);
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
  // console.log(manager_email)
  console.log('-----------1. find manager');
  const event_manager = await models.user.findOne({ where: { email: manager_email } });
  console.log('----------- 2. found manager');
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
    };
  });
  console.log(JSON.stringify(add_users));
  const [project, new_users, new_tasks] = await Promise.all([
    models.project.create(add_project),
    models.user.bulkCreate(add_users, { individualHooks: true, returning: true }),
    models.task.bulkCreate(add_tasks, { individualHooks: true, returning: true }),
  ]);
  // Promise.all([project.save(), new_users.save(), new_tasks.save()]);
  console.log(project.toJSON())
    // console.log(new_users.toJSON())
  console.log('assign manager to project');
  await project.setUser(event_manager);
  console.log('finished assigning manager to project');

  // console.log(new_users)
  for (const user of new_users) {
    show_object_methods(user);
    console.log(user.toJSON())
    user.addProject(project);
  }
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