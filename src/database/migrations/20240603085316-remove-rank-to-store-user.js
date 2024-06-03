'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('store_users', 'rank_id');
  },

  async down(queryInterface, Sequelize) {
    // Trong trường hợp bạn muốn khôi phục lại cột rank_id, bạn cần định nghĩa lại cột này trong phần down.
    await queryInterface.addColumn('store_users', 'rank_id', {
      type: Sequelize.INTEGER,
      references: { model: 'ranks', key: 'id' },
      allowNull: true
    });
  }
};
