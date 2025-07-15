"use strict";

const bcrypt = require("bcryptjs");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Admins
    const firstAdminPassword = await bcrypt.hash("admin123", 10);
    const secondAdminPassword = await bcrypt.hash("admin456", 10);
    //Teachers
    const firstTeacherPassword = await bcrypt.hash("teacher123", 10);
    const secondTeacherPassword = await bcrypt.hash("teacher456", 10);
    const thirdTeacherPassword = await bcrypt.hash("teacher789", 10);
    // Students
    const firstStudentPassword = await bcrypt.hash("student123", 10);
    const secondStudentPassword = await bcrypt.hash("student456", 10);
    const thirdStudentPassword = await bcrypt.hash("student789", 10);
    await queryInterface.bulkInsert(
      "users",
      [
        // Admins
        {
          name: "Morteza Pourrajab",
          email: "morteza.pourrajab@example.com",
          password: firstAdminPassword,
          roleId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Erfan Yousefi",
          email: "erfan.yousefi@example.com",
          password: secondAdminPassword,
          roleId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        // Teachers
        {
          name: "Sara Ahmadi",
          email: "sara.ahmadi@example.com",
          password: firstTeacherPassword,
          roleId: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Ali Rezaei",
          email: "ali.rezaei@example.com",
          password: secondTeacherPassword,
          roleId: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Maryam Hosseini",
          email: "maryam.hosseini@example.com",
          password: thirdTeacherPassword,
          roleId: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        // Students
        {
          name: "Reza Karimi",
          email: "reza.karimi@example.com",
          password: firstStudentPassword,
          roleId: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Fatemeh Ghasemi",
          email: "fatemeh.ghasemi@example.com",
          password: secondStudentPassword,
          roleId: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Mohammad Jafari",
          email: "mohammad.jafari@example.com",
          password: thirdStudentPassword,
          roleId: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", null, {});
  },
};
