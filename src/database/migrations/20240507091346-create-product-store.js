'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product_stores', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      store_id: {
        type: Sequelize.UUID
      },
      product_id: {
        type: Sequelize.UUID
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('product_stores');
  }
};
