'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Logic để xóa bảng user_rewards
    await queryInterface.dropTable('user_rewards');
  },

  async down(queryInterface, Sequelize) {
    // Logic để tạo lại bảng user_rewards
    await queryInterface.createTable('user_rewards', {
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
      product_id: {
        type: Sequelize.INTEGER,
        references: { model: 'gifts', key: 'id' }
      },
      quantity: {
        type: Sequelize.INTEGER
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
    });
  }
};
