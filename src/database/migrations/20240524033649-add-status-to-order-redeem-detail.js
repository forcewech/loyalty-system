'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('order_redeem_details', 'status', {
      type: Sequelize.ENUM('not redeemed', 'redeemed'),
      defaultValue: 'not redeemed'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('order_redeem_details', 'status');
  }
};
