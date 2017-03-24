'use strict';
module.exports = function(sequelize, DataTypes) {
  var project = sequelize.define('project', {
    name: DataTypes.STRING,
    start_date: DataTypes.DATE,
    end_date: DataTypes.DATE
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        project.hasMany(models.assigned_user)
        project.hasMany(models.manager_user)
        project.hasMany(models.task)
      }
    }
  });
  return project;
};