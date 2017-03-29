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
    return queryInterface.bulkInsert('users', [
      {
        first_name: 'Tom',
        last_name: 'Tommington',
        email: 't@t.com',
        createdAt: new Date(), 
        updatedAt: new Date(),
        id: 1
      },
      { 
        first_name: 'Lucy',
        last_name: 'Luck',
        email: 't@t.com',
        createdAt: new Date(), 
        updatedAt: new Date(),
        id: 2
      },
      { 
        first_name: 'Ben',
        last_name: 'Benson',
        email: 't@t.com',
        createdAt: new Date(), 
        updatedAt: new Date(),
        id: 3
      },
      { 
        first_name: 'Steve',
        last_name: 'Stevery',
        email: 't@t.com',
        createdAt: new Date(), 
        updatedAt: new Date(),
        id: 4
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
    return queryInterface.bulkDelete('users', null, {});
  }
};
