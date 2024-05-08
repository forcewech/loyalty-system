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
        type: Sequelize.UUID,
        references: { model: 'stores', key: 'store_id' }
      },
      rank_id: {
        type: Sequelize.UUID,
        references: { model: 'ranks', key: 'rank_id' }
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('store_ranks');
  }
};
