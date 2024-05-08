'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('order_details', {
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
      user_id: {
        type: Sequelize.UUID,
        references: { model: 'users', key: 'user_id' }
      },
      rank_id: {
        type: Sequelize.UUID,
        references: { model: 'ranks', key: 'rank_id' }
      },
      total_money: {
        type: Sequelize.FLOAT
      },
      total_point: {
        type: Sequelize.FLOAT
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('order_details');
  }
};
