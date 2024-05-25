'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'order_redeem_details',
      {
        id: {
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
          type: Sequelize.INTEGER
        },
        order_redeem_id: {
          type: Sequelize.INTEGER,
          references: { model: 'order_redeems', key: 'id' }
        },
        user_id: {
          type: Sequelize.INTEGER,
          references: { model: 'users', key: 'id' }
        },
        rank_id: {
          type: Sequelize.INTEGER,
          references: { model: 'ranks', key: 'id' }
        },
        product_id: {
          type: Sequelize.INTEGER,
          references: { model: 'gifts', key: 'id' }
        },
        quantity: {
          type: Sequelize.INTEGER
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
    await queryInterface.dropTable('order_redeem_details');
  }
};
