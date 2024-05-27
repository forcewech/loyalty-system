'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('stores', 'role', {
      type: Sequelize.STRING,
      defaultValue: 'store'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('stores', 'role');
  }
};
