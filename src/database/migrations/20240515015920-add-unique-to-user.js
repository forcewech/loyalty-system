'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('users', {
      type: 'unique',
      fields: ['email'],
      name: 'unique_email_constraint_in_users'
    });
    await queryInterface.addConstraint('users', {
      type: 'unique',
      fields: ['phone'],
      name: 'unique_phone_constraint_in_users'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('users', 'unique_email_constraint_in_users');
    await queryInterface.removeConstraint('stores', 'unique_phone_constraint_in_users');
  }
};
