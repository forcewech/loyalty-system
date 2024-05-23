'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('refresh_tokens', 'admin_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // or false depending on your requirements
      references: {
        model: 'admin', // replace with your actual admin table name
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('refresh_tokens', 'store_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // or false depending on your requirements
      references: {
        model: 'stores', // replace with your actual store table name
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('refresh_tokens', 'admin_id');
    await queryInterface.removeColumn('refresh_tokens', 'store_id');
  }
};
