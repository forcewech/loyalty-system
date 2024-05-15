'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', 'rank_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1
    });

    // Bước 2: Thiết lập khóa ngoại cho cột 'rank_id'
    await queryInterface.addConstraint('users', {
      fields: ['rank_id'],
      type: 'foreign key',
      name: 'fk_users_rank_id', // Tên của ràng buộc khóa ngoại
      references: {
        table: 'ranks',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('users', 'fk_users_rank_id');

    // Bước 2: Thay đổi cột 'rank_id' về trạng thái ban đầu
    await queryInterface.changeColumn('users', 'rank_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null
    });
  }
};
