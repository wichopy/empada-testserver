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
          assigned_start_time: new Date(5, 5, 5, 5),
          assigned_end_time: new Date(6, 6, 6, 6),
          start_time: undefined,
          end_time: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 1
        }, 
        {
          name: 'catering',
          description: 'Provide food.',
          projectId: 1,
          assigned_start_time: new Date(4, 4, 4, 4),
          assigned_end_time: new Date(6, 6, 6, 6),
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
          assigned_start_time: new Date(9, 9, 9, 9),
          assigned_end_time: new Date(10, 10 ,10 ,10),
          start_time: undefined,
          end_time: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 3
        },
        {
          name: 'dj',
          description: 'Play music.',
          projectId: 1,
          assigned_start_time: new Date(1, 1, 1, 1),
          assigned_end_time: new Date(4, 4, 4, 4),
          start_time: undefined,
          end_time: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 4
        },
        {
          name: 'mover',
          description: 'Move a lot.',
          projectId: 1,
          assigned_start_time: new Date(7, 7, 7, 7),
          assigned_end_time: new Date(9, 9, 9, 9),
          start_time: undefined,
          end_time: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 1
        },
        {
          name: 'provider',
          description: 'Buy things.',
          projectId: 1,
          assigned_start_time: new Date(11, 11, 11, 11),
          assigned_end_time: new Date(12, 12, 12, 12),
          start_time: undefined,
          end_time: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 1
        },
        {
          name: 'food',
          description: 'Acquire food.',
          projectId: 1,
          assigned_start_time: new Date(12, 12, 12, 12),
          assigned_end_time: new Date(16, 16, 16, 16),
          start_time: undefined,
          end_time: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 1
        },
        {
          name: 'stuff',
          description: 'Gather stuff.',
          projectId: 1,
          assigned_start_time: new Date(6, 6, 6, 6),
          assigned_end_time: new Date(12, 12, 12, 12),
          start_time: undefined,
          end_time: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 2
        },
        {
          name: 'stuff',
          description: 'Acquire stuff.',
          projectId: 1,
          assigned_start_time: new Date(5, 5, 5, 5),
          assigned_end_time: new Date(10, 10, 10, 10),
          start_time: undefined,
          end_time: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 3
        },
        {
          name: 'stuff',
          description: 'Create stuff.',
          projectId: 1,
          assigned_start_time: new Date(10, 10, 10, 10),
          assigned_end_time: new Date(18, 18, 18, 18),
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
