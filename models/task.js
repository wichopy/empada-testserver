'use strict';
module.exports = function(sequelize, DataTypes) {
  var task = sequelize.define('task', {
    project_id: DataTypes.INTEGER,
    task_name: DataTypes.STRING,
    task_description: DataTypes.STRING,
    start_date: DataTypes.DATE,
    end_date: DataTypes.DATE,
    assigned_start_date: DataTypes.DATE,
    assigned_end_date: DataTypes.DATE
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        task.belongsTo(models.project)
      }
    }
  });
  return task;
};