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
        type: Sequelize.UUID,
        references: { model: 'stores', key: 'store_id' }
      },
      product_id: {
        type: Sequelize.UUID,
        references: { model: 'gifts', key: 'product_id' }
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('product_stores');
  }
};
