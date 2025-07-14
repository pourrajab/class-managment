require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME || "class_management",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "123456",
  {
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || "mysql",
    logging: process.env.DB_LOGGING === "true" || false,
  }
);

module.exports = sequelize;
