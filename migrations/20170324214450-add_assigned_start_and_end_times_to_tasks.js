'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return [
      queryInterface.addColumn('tasks', 'assigned_start_time', {type: Sequelize.DATE}),
      queryInterface.addColumn('tasks', 'assigned_end_time', {type: Sequelize.DATE})
      ];
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    return [
      queryInterface.removeColumn('tasks', 'assigned_start_time'),
      queryInterface.removeColumn('tasks', 'assigned_end_time')
    ];
  }
};
