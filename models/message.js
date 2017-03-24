'use strict';
module.exports = function(sequelize, DataTypes) {
  var message = sequelize.define('message', {
    messages: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return message;
};