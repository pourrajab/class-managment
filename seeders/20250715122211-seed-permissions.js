"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "permissions",
      [
        // User permissions
        {
          id: 1,
          title: "user view",
          description: "مشاهده کاربران",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          title: "user create",
          description: "ایجاد کاربر",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          title: "user update",
          description: "ویرایش کاربر",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 4,
          title: "user delete",
          description: "حذف کاربر",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        // Course permissions
        {
          id: 5,
          title: "course view",
          description: "مشاهده دوره‌ها",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 6,
          title: "course create",
          description: "ایجاد دوره",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 7,
          title: "course update",
          description: "ویرایش دوره",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 8,
          title: "course delete",
          description: "حذف دوره",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        // Session permissions
        {
          id: 9,
          title: "session view",
          description: "مشاهده جلسات",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 10,
          title: "session create",
          description: "ایجاد جلسه",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 11,
          title: "session update",
          description: "ویرایش جلسه",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 12,
          title: "session delete",
          description: "حذف جلسه",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        // Enrollment permissions
        {
          id: 13,
          title: "enrollment view",
          description: "مشاهده ثبت‌نام‌ها",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 14,
          title: "enrollment create",
          description: "ایجاد ثبت‌نام",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 15,
          title: "enrollment update",
          description: "ویرایش ثبت‌نام",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 16,
          title: "enrollment delete",
          description: "حذف ثبت‌نام",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        // Attendance permissions
        {
          id: 17,
          title: "attendance view",
          description: "مشاهده حضور و غیاب",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 18,
          title: "attendance create",
          description: "ایجاد حضور و غیاب",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 19,
          title: "attendance update",
          description: "ویرایش حضور و غیاب",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 20,
          title: "attendance delete",
          description: "حذف حضور و غیاب",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        // Payment permissions
        {
          id: 21,
          title: "payment view",
          description: "مشاهده پرداخت‌ها",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 22,
          title: "payment create",
          description: "ایجاد پرداخت",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 23,
          title: "payment update",
          description: "ویرایش پرداخت",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 24,
          title: "payment delete",
          description: "حذف پرداخت",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        // Report permissions
        {
          id: 25,
          title: "report view",
          description: "مشاهده گزارشات",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("permissions", null, {});
  },
};
