'use strict';
module.exports = function(sequelize, DataTypes) {
  const manager_user = sequelize.define('manager_user', {
    user_id: DataTypes.INTEGER,
    project_id: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: (models) => {
        // associations can be defined here
        manager_user.belongsTo(models.user)
        manager_user.belongsTo(models.project)
      },
      timestamps: true
    }
  });
  return manager_user;
};