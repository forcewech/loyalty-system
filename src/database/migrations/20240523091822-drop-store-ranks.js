'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Xóa bảng store_ranks
    await queryInterface.dropTable('store_ranks');
  },

  async down(queryInterface, Sequelize) {
    // Tạo lại bảng store_ranks nếu cần phải rollback
    await queryInterface.createTable('store_ranks', {
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: Sequelize.INTEGER
      },
      rank_id: {
        type: Sequelize.INTEGER,
        references: { model: 'ranks', key: 'id' }
      },
      store_id: {
        type: Sequelize.INTEGER,
        references: { model: 'stores', key: 'id' }
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
