'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('order_redeem_details', 'total_prices', {
      allowNull: true,
      type: Sequelize.FLOAT
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('order_redeem_details', 'total_prices');
  }
};
