'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('user_rewards', 'quantity', {
      type: Sequelize.INTEGER
    });
    await queryInterface.addColumn('user_rewards', 'redeem_date', {
      type: Sequelize.DATE
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('user_rewards', 'quantity');
    await queryInterface.removeColumn('user_rewards', 'redeem_date');
  }
};
