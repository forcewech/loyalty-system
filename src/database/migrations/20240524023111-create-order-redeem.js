'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'order_redeems',
      {
        id: {
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
          type: Sequelize.INTEGER
        },
        user_id: {
          type: Sequelize.INTEGER,
          references: { model: 'users', key: 'id' }
        },
        rank_id: {
          type: Sequelize.INTEGER,
          references: { model: 'ranks', key: 'id' }
        },
        redeem_date: {
          type: Sequelize.DATE
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE
        }
      },
      {
        paranoid: true // Chế độ paranoid được kích hoạt
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('order_redeems');
  }
};
