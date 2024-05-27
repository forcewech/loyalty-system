'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'stores',
      {
        id: {
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
          type: Sequelize.INTEGER
        },
        name: {
          type: Sequelize.STRING
        },
        address: {
          type: Sequelize.STRING
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE
        }
      },
      {
        paranoid: true // Chế độ paranoid được kích hoạt
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('stores');
  }
};
