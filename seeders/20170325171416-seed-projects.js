'use strict';
const Project = require('../models/project')

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
    // let project = Project.build(
    //   {
    //     name: 'Wedding',
    //     start_date: new Date(),
    //     end_date: new Date(),
    //     createdAt: new Date(),
    //     updatedAt: new Date(),
    //     id: 1,
    //     userId: 1
    //   }
    // ).save()
    return queryInterface.bulkInsert('projects', [
      {
        name: 'Wedding',
        start_date: new Date(),
        end_date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
        userId: 1
      },
      {
        name: 'Dancing',
        start_date: new Date(),
        end_date: new Date(),
        createdAt: new Date(), 
        updatedAt: new Date(),
        id: 2,
        userId: 2
      },
      ], {});
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
