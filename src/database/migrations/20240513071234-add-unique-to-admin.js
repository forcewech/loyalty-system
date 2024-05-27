'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('admin', {
      type: 'unique',
      fields: ['email'],
      name: 'unique_email_constraint_in_admin'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('admin', 'unique_email_constraint_in_admin');
  }
};
