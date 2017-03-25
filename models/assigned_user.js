module.exports = function(sequelize, DataTypes) {
  const assigned_user = sequelize.define('assigned_user', {
    user_id: DataTypes.INTEGER,
    project_id: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        assigned_user.belongsTo(models.user)
        assigned_user.belongsTo(models.project)
        assigned_user.hasMany(models.task)
      },
      timestamps: true
    }
  });
  return assigned_user;
};