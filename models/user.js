'use strict';
module.exports = function (sequelize, DataTypes) {
  var user = sequelize.define('user', {
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: DataTypes.STRING,
    avatar: DataTypes.STRING,
  }, {
    classMethods: {
      associate: function (models) {
        // associations can be defined here
        // user.hasMany(models.assigned_user)
        user.hasMany(models.project)
        user.hasMany(models.task)
        user.belongsToMany(models.project, { through: "assigned_users" })
      }
    }
  });
  return user;
};