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
        type: Sequelize.UUID,
        references: { model: 'users', key: 'user_id' }
      },
      rank_id: {
        type: Sequelize.UUID,
        references: { model: 'ranks', key: 'rank_id' }
      },
      product_id: {
        type: Sequelize.UUID,
        references: { model: 'gifts', key: 'product_id' }
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_rewards');
  }
};
