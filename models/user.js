'use strict';
module.exports = function(sequelize, DataTypes) {
  var user = sequelize.define('user', {
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        user.hasMany(models.assigned_user)
        user.hasMany(models.manager_user)
      },
      timestamps: true

    }
  });
  return user;
};