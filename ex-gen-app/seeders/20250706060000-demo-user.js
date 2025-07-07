'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const saltRounds = 10;
    const hashedPassword1 = await bcrypt.hash('123', saltRounds);
    const hashedPassword2 = await bcrypt.hash('456', saltRounds);
    const hashedPassword3 = await bcrypt.hash('789', saltRounds);

    await queryInterface.bulkInsert('Users', [
      { name: 'Taro Yamada', pass: hashedPassword1, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Hanako Sato', pass: hashedPassword2, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Jiro Suzuki', pass: hashedPassword3, createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};