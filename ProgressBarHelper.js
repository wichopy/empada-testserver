module.exports = dbToProgressBar = (Tasks, Users) => {
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
  let output = [].filter((t) => t);
  let projectIds = Tasks.map((t) => t.projectId)
  let userIds = Tasks.map((t) => t.userId)

  //create array of unique project and user ids.
  projectIds.unique().forEach((pid) => {
    userIds.unique().forEach((uid) => {
      output.push({
        userId: uid,
        projectId: pid,
        completed_tasks: 0,
        incomplete_tasks: 0
      });
    });
  });
  output.forEach((upid) => {
    let ProjectUserTasks = Tasks.filter((t) => {
        return +t.projectId === +upid.projectId && +t.userId === +upid.userId
      })
    Users.forEach((u) => {
        if (u.id === upid.userId) {
          upid.name = u.name
        }
      })
    ProjectUserTasks.forEach((task) => {
        // console.log(upid)
        // console.log(task)
        if (task.end_time) {
          if (upid.completed_tasks) {
            upid.completed_tasks += 1
          } else {
            upid.completed_tasks = 1
          }
        } else {
          if (upid.incomplete_tasks) {
            upid.incomplete_tasks += 1
          } else {
            upid.incomplete_tasks = 1
          }
        }
        if (upid.total_tasks) {
          upid.total_tasks += 1
        } else {
          upid.total_tasks = 1
        }
      })
    let upidDivisions = 100 / upid.total_tasks;
    upid.completed_tasks *= upidDivisions
    upid.incomplete_tasks *= upidDivisions
  })
  return output.filter((pb) => pb.completed_tasks || pb.incomplete_tasks || pb.total_tasks);
}