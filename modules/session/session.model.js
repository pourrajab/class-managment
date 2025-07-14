"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/sequelize.config");

const Session = sequelize.define(
  "Session",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "شناسه دوره باید عدد باشد" },
        min: { args: [1], msg: "شناسه دوره باید مثبت باشد" },
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "عنوان جلسه نمی‌تواند خالی باشد" },
        len: {
          args: [3, 100],
          msg: "عنوان جلسه باید بین 3 تا 100 کاراکتر باشد",
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: "توضیحات نمی‌تواند بیشتر از 500 کاراکتر باشد",
        },
      },
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: { msg: "تاریخ معتبر نیست" },
        isAfterNow(value) {
          if (new Date(value) <= new Date()) {
            throw new Error("تاریخ جلسه باید در آینده باشد");
          }
        },
      },
    },
    duration: {
      type: DataTypes.INTEGER, // دقیقه
      allowNull: false,
      defaultValue: 90,
      validate: {
        isInt: { msg: "مدت زمان باید عدد باشد" },
        min: { args: [15], msg: "مدت زمان باید حداقل 15 دقیقه باشد" },
        max: { args: [480], msg: "مدت زمان نمی‌تواند بیشتر از 8 ساعت باشد" },
      },
    },
    status: {
      type: DataTypes.ENUM(
        "scheduled",
        "in_progress",
        "completed",
        "cancelled"
      ),
      allowNull: false,
      defaultValue: "scheduled",
      validate: {
        isIn: {
          args: [["scheduled", "in_progress", "completed", "cancelled"]],
          msg: "وضعیت باید یکی از scheduled، in_progress، completed یا cancelled باشد",
        },
      },
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [0, 100],
          msg: "مکان نمی‌تواند بیشتر از 100 کاراکتر باشد",
        },
      },
    },
    maxStudents: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isInt: { msg: "حداکثر تعداد دانشجویان باید عدد باشد" },
        min: { args: [1], msg: "حداکثر تعداد دانشجویان باید حداقل 1 باشد" },
      },
    },
  },
  {
    modelName: "Session",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Session;
