'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('Person', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
    return queryInterface.bulkInsert('tasks', [
        {
          name: 'photography',
          description: 'Take photos of the couple.',
          projectId: 1,
          assigned_start_time: new Date(),
          assigned_end_time: new Date(),
          start_time:undefined,
          end_time: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 1
        }, 
        {
          name: 'catering',
          description: 'Provide food.',
          projectId: 1,
          assigned_start_time: new Date(),
          assigned_end_time: new Date(),
          start_time:undefined,
          end_time: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 2
        },
        {
          name: 'dancing',
          description: 'Dance.',
          projectId: 1,
          assigned_start_time: new Date(),
          assigned_end_time: new Date(),
          start_time: undefined,
          end_time: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 3
        },
        {
          name: 'dj',
          description: 'Play music.',
          projectId: 2,
          assigned_start_time: new Date(),
          assigned_end_time: new Date(),
          start_time: undefined,
          end_time: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 4
        },
        {
          name: 'mover',
          description: 'Of body.',
          projectId: 1,
          assigned_start_time: new Date(),
          assigned_end_time: new Date(),
          start_time: undefined,
          end_time: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 1
        },
        {
          name: 'provider',
          description: 'Of things.',
          projectId: 1,
          assigned_start_time: new Date(),
          assigned_end_time: new Date(),
          start_time: undefined,
          end_time: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 1
        },
        {
          name: 'food',
          description: 'More food.',
          projectId: 1,
          assigned_start_time: new Date(),
          assigned_end_time: new Date(),
          start_time: undefined,
          end_time: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 1
        },
        {
          name: 'stuff',
          description: 'More stuff.',
          projectId: 1,
          assigned_start_time: new Date(),
          assigned_end_time: new Date(),
          start_time: undefined,
          end_time: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 2
        },
        {
          name: 'stuff',
          description: 'More stuff.',
          projectId: 1,
          assigned_start_time: new Date(),
          assigned_end_time: new Date(),
          start_time: undefined,
          end_time: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 3
        },
        {
          name: 'stuff',
          description: 'More stuff.',
          projectId: 1,
          assigned_start_time: new Date(),
          assigned_end_time: new Date(),
          start_time: undefined,
          end_time: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 3
        }
      ], {});
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('Person', null, {});
    */
    return queryInterface.bulkDelete('tasks', null, {});
  }
};
