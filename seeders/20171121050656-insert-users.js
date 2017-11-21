'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [{
      email: 'test4@gmail.com',
      pass: '123'
    },
    {
      email: 'test5@gmail.com',
      pass: '456'
    },
    {
      email: 'test6@gmail.com',
      pass: '789'
    }
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    /* remove all */
    return queryInterface.bulkDelete('Users', null, {});
  }
};
