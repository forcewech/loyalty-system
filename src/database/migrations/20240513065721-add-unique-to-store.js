'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('stores', {
      type: 'unique',
      fields: ['email'],
      name: 'unique_email_constraint_in_stores'
    });
    await queryInterface.addConstraint('stores', {
      type: 'unique',
      fields: ['name'],
      name: 'unique_name_constraint_in_stores'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('stores', 'unique_email_constraint_in_stores');
    await queryInterface.removeConstraint('stores', 'unique_name_constraint_in_stores');
  }
};
