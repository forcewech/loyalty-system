'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
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
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_rewards');
  }
};
