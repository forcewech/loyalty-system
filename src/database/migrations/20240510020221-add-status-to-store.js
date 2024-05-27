'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('stores', 'status', {
      type: Sequelize.ENUM('active', 'inactive'),
      defaultValue: 'inactive'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('stores', 'status');
  }
};
