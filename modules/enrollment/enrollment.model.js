"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/sequelize.config");

const Enrollment = sequelize.define(
  "Enrollment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "شناسه کاربر باید عدد باشد" },
        min: { args: [1], msg: "شناسه کاربر باید مثبت باشد" },
      },
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "شناسه دوره باید عدد باشد" },
        min: { args: [1], msg: "شناسه دوره باید مثبت باشد" },
      },
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "accepted",
        "rejected",
        "completed",
        "cancelled"
      ),
      allowNull: false,
      defaultValue: "pending",
      validate: {
        isIn: {
          args: [["pending", "accepted", "rejected", "completed", "cancelled"]],
          msg: "وضعیت باید یکی از pending، accepted، rejected، completed یا cancelled باشد",
        },
      },
    },
    enrollmentDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: { msg: "تاریخ ثبت‌نام معتبر نیست" },
      },
    },
    completionDate: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: { msg: "تاریخ تکمیل معتبر نیست" },
      },
    },
    grade: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: { args: [0], msg: "نمره نمی‌تواند کمتر از 0 باشد" },
        max: { args: [100], msg: "نمره نمی‌تواند بیشتر از 100 باشد" },
      },
    },
    certificateIssued: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    certificateIssueDate: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: { msg: "تاریخ صدور گواهی معتبر نیست" },
      },
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: "یادداشت نمی‌تواند بیشتر از 500 کاراکتر باشد",
        },
      },
    },
  },
  {
    modelName: "Enrollment",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Enrollment;
