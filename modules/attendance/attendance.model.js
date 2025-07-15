const { DataTypes } = require("sequelize");
const sequelize = require("../../config/sequelize.config");

const Attendance = sequelize.define(
  "Attendance",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    enrollmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "شناسه ثبت‌نام باید عدد باشد" },
        min: { args: [1], msg: "شناسه ثبت‌نام باید مثبت باشد" },
      },
    },
    sessionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "شناسه جلسه باید عدد باشد" },
        min: { args: [1], msg: "شناسه جلسه باید مثبت باشد" },
      },
    },
    present: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    arrivalTime: {
      type: DataTypes.TIME,
      allowNull: true,
      validate: {
        is: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/,
        msg: "زمان ورود معتبر نیست",
      },
    },
    departureTime: {
      type: DataTypes.TIME,
      allowNull: true,
      validate: {
        is: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/,
        msg: "زمان خروج معتبر نیست",
      },
    },
    lateMinutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        isInt: { msg: "دقایق تاخیر باید عدد باشد" },
        min: { args: [0], msg: "دقایق تاخیر نمی‌تواند منفی باشد" },
      },
    },
    earlyDepartureMinutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        isInt: { msg: "دقایق خروج زودهنگام باید عدد باشد" },
        min: { args: [0], msg: "دقایق خروج زودهنگام نمی‌تواند منفی باشد" },
      },
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 200],
          msg: "یادداشت نمی‌تواند بیشتر از 200 کاراکتر باشد",
        },
      },
    },
    recordedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "شناسه ثبت‌کننده باید عدد باشد" },
        min: { args: [1], msg: "شناسه ثبت‌کننده باید مثبت باشد" },
      },
    },
    recordingMethod: {
      type: DataTypes.ENUM(
        "manual",
        "automatic",
        "qr_code",
        "face_recognition"
      ),
      allowNull: false,
      defaultValue: "manual",
      validate: {
        isIn: {
          args: [["manual", "automatic", "qr_code", "face_recognition"]],
          msg: "روش ثبت باید یکی از manual، automatic، qr_code یا face_recognition باشد",
        },
      },
    },
  },
  {
    modelName: "Attendance",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Attendance;
