"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/sequelize.config");

const Course = sequelize.define(
  "Course",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "عنوان دوره نمی‌تواند خالی باشد" },
        len: {
          args: [3, 100],
          msg: "عنوان دوره باید بین 3 تا 100 کاراکتر باشد",
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 1000],
          msg: "توضیحات نمی‌تواند بیشتر از 1000 کاراکتر باشد",
        },
      },
    },
    teacherId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "شناسه استاد باید عدد باشد" },
        min: { args: [1], msg: "شناسه استاد باید مثبت باشد" },
      },
    },
  },
  {
    modelName: "Course",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Course;
