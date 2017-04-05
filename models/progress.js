'use strict';
module.exports = function (sequelize, DataTypes) {
  var task = sequelize.define('progress', {
    name: DataTypes.STRING,
    completed_tasks: DataTypes.INTEGER,
    incomplete_tasks: DataTypes.INTEGER,
    total_tasks: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function (models) {
        // associations can be defined here
        progress.belongsTo(models.project)
        progres.belongsTo(models.user)
      }
    }
  });
  return progress;
};
