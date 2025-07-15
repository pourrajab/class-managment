"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "roles",
      [
        {
          id: 1,
          title: "admin",
          description: "Administrator",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          title: "teacher",
          description: "Teacher",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          title: "student",
          description: "Student",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("roles", null, {});
  },
};
