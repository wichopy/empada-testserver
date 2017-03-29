'use strict';
module.exports = function (sequelize, DataTypes) {
  var task = sequelize.define('task', {
    // project_id: DataTypes.INTEGER,
    // user_id: DataTypes.INTEGER
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    start_time: DataTypes.DATE,
    end_time: DataTypes.DATE,
    assigned_start_time: DataTypes.DATE,
    assigned_end_time: DataTypes.DATE
  }, {
    classMethods: {
      associate: function (models) {
        // associations can be defined here
        task.belongsTo(models.project)
        task.belongsTo(models.user)
      }
    }
  });
  return task;
};