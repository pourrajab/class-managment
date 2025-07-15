"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "role_permissions",
      [
        // Admin (roleId: 1) - همه دسترسی‌ها
        {
          roleId: 1,
          permissionId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 1,
          permissionId: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 1,
          permissionId: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 1,
          permissionId: 4,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 1,
          permissionId: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 1,
          permissionId: 6,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 1,
          permissionId: 7,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 1,
          permissionId: 8,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 1,
          permissionId: 9,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 1,
          permissionId: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 1,
          permissionId: 11,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 1,
          permissionId: 12,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 1,
          permissionId: 13,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 1,
          permissionId: 14,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 1,
          permissionId: 15,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 1,
          permissionId: 16,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 1,
          permissionId: 17,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 1,
          permissionId: 18,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 1,
          permissionId: 19,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 1,
          permissionId: 20,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 1,
          permissionId: 21,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 1,
          permissionId: 22,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 1,
          permissionId: 23,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 1,
          permissionId: 24,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 1,
          permissionId: 25,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        // Teacher (roleId: 2)
        {
          roleId: 2,
          permissionId: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 2,
          permissionId: 6,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 2,
          permissionId: 7,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 2,
          permissionId: 8,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 2,
          permissionId: 9,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 2,
          permissionId: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 2,
          permissionId: 11,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 2,
          permissionId: 12,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 2,
          permissionId: 13,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 2,
          permissionId: 14,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 2,
          permissionId: 15,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 2,
          permissionId: 16,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 2,
          permissionId: 17,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 2,
          permissionId: 18,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 2,
          permissionId: 19,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 2,
          permissionId: 20,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 2,
          permissionId: 25,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        // Student (roleId: 3)
        {
          roleId: 3,
          permissionId: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 3,
          permissionId: 9,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 3,
          permissionId: 13,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 3,
          permissionId: 17,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 3,
          permissionId: 21,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 3,
          permissionId: 25,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("role_permissions", null, {});
  },
};
