'use strict';
module.exports = function(sequelize, DataTypes) {
  var task = sequelize.define('task', {
    project_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    start_time: DataTypes.DATE,
    end_date: DataTypes.DATE
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        task.belongsTo(models.project)
      }, 
      timestamps: true
    }
  });
  return task;
};