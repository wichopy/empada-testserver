'use strict';
module.exports = function (sequelize, DataTypes) {
  var project = sequelize.define('project', {
    name: DataTypes.STRING,
    start_date: DataTypes.DATE,
    end_date: DataTypes.DATE,
    description: DataTypes.STRING
  }, {
    classMethods: {
      associate: function (models) {
        // associations can be defined here
        project.belongsToMany(models.user, { through: "assigned_users" })
          // project.hasMany(models.manager_user)
        project.belongsTo(models.user)
        project.hasMany(models.task)
      },
      timestamps: true
    }
  });
  return project;
};