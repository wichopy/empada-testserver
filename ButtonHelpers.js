const ProgressBarHelper = require('./ProgressBarHelper.js')
const models = require("./models");
module.exports = {
  clickedStartButton: (data, broadcastToClients) => {
    const message = {
      type: "start-time-button-clicked",
      id: data.id
    }
    broadcastToClients(message);
  },
  clickedEndButton: (data, broadcastToClients) => {
    const message = {
      type: "end-time-button-clicked",
      id: data.id
    }
    broadcastToClients(message);
  },
  startTimeForContractorTasks: (data) => {
    models.task
      .update({
        start_time: data.start_time
      }, {
        where: {
          id: data.id
        }
      })
      .catch((err) => {
        console.error(err);
      })
  },
  endTimeForContractorTasks: (data, broadcastToClients) => {
    models.task
      .update({
        end_time: data.end_time
      }, {
        where: {
          id: data.id
        }
      })
      .then((res) => {
        this.sendDonutGraphInfo(data, broadcastToClients);
      })
      .catch((err) => {
        console.error(err);
      })
  },
  sendDonutGraphInfo: (data, broadcastToClients) => {
    models.task.findAll({ raw: true }).then((tasks) => {
      models.user.findAll({ raw: true }).then((users) => {
        users = users.map((u) => { return { id: u.id, name: u.first_name }; })
        let progress_bar = ProgressBarHelper(tasks, users)
        let message = {
          type: 'update-progress-bar',
          progress_bar: progress_bar
        }
        broadcastToClients(message);
      })
    })
  }
}