'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('store_ranks', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      store_id: {
        type: Sequelize.UUID
      },
      rank_id: {
        type: Sequelize.UUID
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('store_ranks');
  }
};
