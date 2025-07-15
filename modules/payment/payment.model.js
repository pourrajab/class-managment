const { DataTypes } = require("sequelize");
const sequelize = require("../../config/sequelize.config");

const Payment = sequelize.define(
  "Payment",
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
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: { msg: "مبلغ باید عدد باشد" },
        min: { args: [0], msg: "مبلغ نمی‌تواند منفی باشد" },
      },
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "paid",
        "failed",
        "refunded",
        "cancelled"
      ),
      allowNull: false,
      defaultValue: "pending",
      validate: {
        isIn: {
          args: [["pending", "paid", "failed", "refunded", "cancelled"]],
          msg: "وضعیت باید یکی از pending، paid، failed، refunded یا cancelled باشد",
        },
      },
    },
    paymentMethod: {
      type: DataTypes.ENUM("cash", "card", "bank_transfer", "online", "check"),
      allowNull: false,
      validate: {
        isIn: {
          args: [["cash", "card", "bank_transfer", "online", "check"]],
          msg: "روش پرداخت باید یکی از cash، card، bank_transfer، online یا check باشد",
        },
      },
    },
    transactionId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        len: {
          args: [0, 100],
          msg: "شناسه تراکنش نمی‌تواند بیشتر از 100 کاراکتر باشد",
        },
      },
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: { msg: "تاریخ پرداخت معتبر نیست" },
      },
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: { msg: "تاریخ سررسید معتبر نیست" },
      },
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
      validate: {
        isDecimal: { msg: "مبلغ تخفیف باید عدد باشد" },
        min: { args: [0], msg: "مبلغ تخفیف نمی‌تواند منفی باشد" },
      },
    },
    taxAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
      validate: {
        isDecimal: { msg: "مبلغ مالیات باید عدد باشد" },
        min: { args: [0], msg: "مبلغ مالیات نمی‌تواند منفی باشد" },
      },
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: { msg: "مبلغ کل باید عدد باشد" },
        min: { args: [0], msg: "مبلغ کل نمی‌تواند منفی باشد" },
      },
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "IRR",
      validate: {
        isIn: {
          args: [["IRR", "USD", "EUR"]],
          msg: "واحد پول باید IRR، USD یا EUR باشد",
        },
      },
    },
    receiptNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        len: {
          args: [0, 50],
          msg: "شماره رسید نمی‌تواند بیشتر از 50 کاراکتر باشد",
        },
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
    processedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isInt: { msg: "شناسه پردازش‌کننده باید عدد باشد" },
        min: { args: [1], msg: "شناسه پردازش‌کننده باید مثبت باشد" },
      },
    },
  },
  {
    modelName: "Payment",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Payment;
