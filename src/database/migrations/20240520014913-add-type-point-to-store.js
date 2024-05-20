'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('stores', 'type_point', {
      type: Sequelize.ENUM('fixed', 'rate'),
      defaultValue: 'fixed'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('stores', 'type_point');
  }
};
