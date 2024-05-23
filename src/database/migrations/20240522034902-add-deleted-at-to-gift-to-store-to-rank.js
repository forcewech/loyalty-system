'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('stores', 'deleted_at', {
      allowNull: true,
      type: Sequelize.DATE
    });
    await queryInterface.addColumn('gifts', 'deleted_at', {
      allowNull: true,
      type: Sequelize.DATE
    });
    await queryInterface.addColumn('ranks', 'deleted_at', {
      allowNull: true,
      type: Sequelize.DATE
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('stores', 'deleted_at');
    await queryInterface.removeColumn('gifts', 'deleted_at');
    await queryInterface.removeColumn('ranks', 'deleted_at');
  }
};
