'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn('refresh_tokens', 'tokenId', 'id');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn('refresh_tokens', 'id', 'tokenId');
  }
};
