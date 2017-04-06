'use strict';
module.exports = function (sequelize, DataTypes) {
  var progress = sequelize.define('progress', {
    name: DataTypes.STRING,
    completed_tasks: DataTypes.INTEGER,
    incomplete_tasks: DataTypes.INTEGER,
    total_tasks: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function (models) {
        // associations can be defined here
        progress.belongsTo(models.project)
        progress.belongsTo(models.user)
      }
    }
  });
  return progress;
};
