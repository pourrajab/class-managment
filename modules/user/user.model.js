// RBAC: The roleId field is now used for user roles. The old role ENUM is removed. Use associations to Role model for all role-based logic.
"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/sequelize.config");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "نام نمی‌تواند خالی باشد" },
        len: { args: [2, 50], msg: "نام باید بین 2 تا 50 کاراکتر باشد" },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: { msg: "ایمیل معتبر نیست" },
        notEmpty: { msg: "ایمیل نمی‌تواند خالی باشد" },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "پسورد نمی‌تواند خالی باشد" },
        len: { args: [6, 100], msg: "پسورد باید حداقل 6 کاراکتر باشد" },
      },
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // Association is defined after model definition (see below)
    },
  },
  {
    modelName: "User",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Remove association code from here; now defined in config/models.initial.js

module.exports = User;
