const models = require("./models");
require('dotenv').config()
const mailgun_api_key = process.env.api_key;
const domain = process.env.domain;
const mailgun = require('mailgun-js')({ apiKey: mailgun_api_key, domain: domain });

async function emailTasks(project_id) {
  /* Given a project ID generate a list of tasks for each assigned user's email and send using mailgun. */
  let project_details = await models.project.findOne({ where: { id: project_id }, raw: true }).then((data) => data);
  // console.log('found project');
  let emails = await models.task.findAll({ where: { projectId: project_id } }).then((tasks) => {
    const email_list = [];
    tasks.forEach((t) => {
      email_list.push(t.getUser().then((u) => {
        // console.log('inside promise, finding email:');
        // console.log(u.toJSON().email);
        return u.toJSON().email
      }))
    })
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
    // console.log(`Promise all finished, output: ${emails.unique()}`)
  project_details = project_details;
  emails = emails.unique()
    // console.log(project_details)
  emails.forEach((user_email) => {
    var data = {
      from: 'Empada Server <noreply@empada.bz>',
      to: user_email,
      subject: `You were invited to ${project_details.name}, an Empada project.`,
      text: `You have been assigned to project code named: ${project_details.name}
Project description: ${project_details.description}
Hit this link to go to your task list: http://blooming-forest-29843.herokuapp.com/.
Have fun! ^ _ ^`
    };

    mailgun.messages().send(data, function (error, body) {
      // console.log(body);
    });
  })
}


async function eventCreation_newProject(data, client) {
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
    end_date: new Date(),
    description: data.description,
  };
  let alreadyRegisteredUsers = []
  let add_users = []
  let query_users = []

  data.assigned_people.forEach((ap) => {
    query_users.push(models.user.findOne({
      where: {
        email: ap.email
      },
      individualHooks: true,
      returning: true,
    }).then((res) => {
      if (res) {
        alreadyRegisteredUsers.push(res)
      } else {

        add_users.push({ first_name: ap.name, email: ap.email });
      }
    }).catch((err) => {
      client.send(JSON.stringify({ type: 'failed-event-creation' }))
    }))
  });
  await Promise.all(query_users)

  const add_tasks = data.tasks.map((t) => {
    return {
      assigned_start_time: new Date(new Date(`${data.startDate}T${t.assigned_start_time}`).getTime() + 4 * 60 * 60 * 1000),
      assigned_end_time: new Date(new Date(`${data.startDate}T${t.assigned_end_time}`).getTime() + 4 * 60 * 60 * 1000),
      name: t.name,
      description: t.description,
      userId: +t.user_id
    };
  });
  let [project, new_users] = await Promise.all([
    models.project.create(add_project),
    models.user.bulkCreate(add_users, { individualHooks: true, returning: true }).catch((err) => {
      client.send(JSON.stringify({ type: 'failed-event-creation' }))
    }),
  ]);
  alreadyRegisteredUsers.forEach((old_user) => new_users.push(old_user))
    // new_users.concat(alreadyRegisteredUsers)

  //assign manager to project.
  await project.setUser(event_manager);

  //assign project to user.
  for (const user of new_users) {
    await user.addProject(project);
  }
  //map front end user id's to inserted user id's
  let user_id_mapping = {};
  for (const ou of data.assigned_people) {
    user_id_mapping[ou.email] = {};
    user_id_mapping[ou.email].old_id = +ou.id;
  }
  for (const nu of new_users) {
    user_id_mapping[nu.toJSON().email].new_id = +nu.toJSON().id;
  }
  let remapped_task_user_ids = add_tasks.map((t) => {
    for (const u in user_id_mapping) {
      if (user_id_mapping[u].old_id == +t.userId) {
        t.userId = +user_id_mapping[u].new_id
        break;
      }
    }
    t.projectId = +project.toJSON().id
    return t;
  })
  let new_tasks = await models.task.bulkCreate(remapped_task_user_ids, { individualHooks: true, returning: true })
    .then(() =>
      client.send(JSON.stringify({ type: 'successful-event-creation' })))
    .catch((err) => {
      client.send(JSON.stringify({ type: 'failed-event-creation' }))
    });

  client.send(JSON.stringify({ type: 'update-progress-bar-with-new-field' }));
  emailTasks(project.toJSON().id)

}

module.exports = eventCreation_newProject;