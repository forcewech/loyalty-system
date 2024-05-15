'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'users',
      {
        id: {
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
          type: Sequelize.INTEGER
        },
        rank_id: {
          type: Sequelize.INTEGER,
          references: { model: 'ranks', key: 'id' }
        },
        full_name: {
          type: Sequelize.STRING
        },
        email: {
          type: Sequelize.STRING
        },
        phone: {
          type: Sequelize.STRING
        },
        password: {
          type: Sequelize.STRING
        },
        gender: {
          type: Sequelize.STRING
        },
        reward_points: {
          type: Sequelize.FLOAT
        },
        reserve_points: {
          type: Sequelize.FLOAT
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        deleted_at: {
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
    await queryInterface.dropTable('users');
  }
};
