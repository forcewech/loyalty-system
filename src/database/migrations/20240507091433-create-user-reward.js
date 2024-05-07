'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_rewards', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      user_id: {
        type: Sequelize.UUID
      },
      rank_id: {
        type: Sequelize.UUID
      },
      product_id: {
        type: Sequelize.UUID
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_rewards');
  }
};
