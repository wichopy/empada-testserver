'use strict';
module.exports = function (sequelize, DataTypes) {
  var notification = sequelize.define('user', {
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    type: DataTypes.STRING,
    time: DataTypes.DATE
  }, {
    classMethods: {
      associate: function (models) {
        // associations can be defined here
        notification.belongsTo(models.project)
      }
    }
  });
  return notification;
};