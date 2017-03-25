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
      }], {});\c 
    */
    return queryInterface.bulkInsert('projects', [{
      name: 'Wedding',
      description: 'A wedding for the beautiful couple.',
      start_date: new Date(),
      end_date: new Date(),
      createdAt: new Date(), 
      updatedAt: new Date()
    }], {});
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('Person', null, {});
    */
    return queryInterface.bulkDelete('projects', null, {});
  }
};
