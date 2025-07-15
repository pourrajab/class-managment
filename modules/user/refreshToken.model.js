const { DataTypes } = require("sequelize");
const sequelize = require("../../config/sequelize.config");

const RefreshToken = sequelize.define(
  "RefreshToken",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: "توکن نمی‌تواند خالی باشد" },
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "شناسه کاربر باید عدد باشد" },
        min: { args: [1], msg: "شناسه کاربر باید مثبت باشد" },
      },
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: { msg: "تاریخ انقضا معتبر نیست" },
        isAfterNow(value) {
          if (new Date(value) <= new Date()) {
            throw new Error("تاریخ انقضا باید در آینده باشد");
          }
        },
      },
    },
    isRevoked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [0, 45],
          msg: "آدرس IP نمی‌تواند بیشتر از 45 کاراکتر باشد",
        },
      },
    },
    userAgent: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: "User Agent نمی‌تواند بیشتر از 500 کاراکتر باشد",
        },
      },
    },
  },
  {
    modelName: "RefreshToken",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        fields: ["token"],
        unique: true,
      },
      {
        fields: ["userId"],
      },
      {
        fields: ["expiresAt"],
      },
    ],
  }
);

module.exports = RefreshToken;
