const { Payment } = require("./payment.model");
const { Course } = require("../course/course.model");
const { User } = require("../user/user.model");
const { Enrollment } = require("../enrollment/enrollment.model");
const { Op } = require("sequelize");
const createHttpError = require("http-errors");

// Get all payments
const getAllPayments = async (req, res, next) => {
  try {
    const {
      courseId,
      userId,
      status,
      paymentMethod,
      page = 1,
      limit = 10,
    } = req.query;

    const where = {};
    const include = [
      {
        model: Course,
        as: "course",
        attributes: ["id", "title", "description"],
        include: [
          {
            model: User,
            as: "teacher",
            attributes: ["id", "name", "email"],
          },
        ],
      },
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "email", "role"],
      },
    ];

    if (courseId) where.courseId = courseId;
    if (userId) where.userId = userId;
    if (status) where.status = status;
    if (paymentMethod) where.paymentMethod = paymentMethod;

    const offset = (page - 1) * limit;

    const payments = await Payment.findAndCountAll({
      where,
      include,
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      data: payments.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(payments.count / limit),
        totalItems: payments.count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get payment by ID
const getPaymentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      throw createHttpError(400, "شناسه پرداخت نامعتبر است");
    }

    const payment = await Payment.findByPk(id, {
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "description"],
          include: [
            {
              model: User,
              as: "teacher",
              attributes: ["id", "name", "email"],
            },
          ],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "role"],
        },
      ],
    });

    if (!payment) {
      throw createHttpError(404, "پرداخت یافت نشد");
    }

    res.json({
      data: payment,
    });
  } catch (err) {
    next(err);
  }
};

// Create new payment
const createPayment = async (req, res, next) => {
  try {
    const {
      courseId,
      amount,
      paymentMethod,
      dueDate,
      notes,
      currency = "IRR",
    } = req.body;
    const userId = req.user.id;

    // Validation
    if (!courseId || !amount || !paymentMethod) {
      throw createHttpError(400, "شناسه دوره، مبلغ و روش پرداخت الزامی است");
    }

    if (amount <= 0) {
      throw createHttpError(400, "مبلغ پرداخت باید بیشتر از صفر باشد");
    }

    // Check if course exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      throw createHttpError(404, "دوره یافت نشد");
    }

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      throw createHttpError(404, "کاربر پیدا نشد");
    }

    // Calculate amounts
    const discountAmount = 0; // Can be calculated from settings or discount code
    const taxAmount = amount * 0.09; // 9% tax
    const totalAmount = amount + taxAmount - discountAmount;

    // Create payment
    const payment = await Payment.create({
      userId,
      courseId,
      amount,
      paymentMethod,
      dueDate: dueDate ? new Date(dueDate) : null,
      notes: notes ? notes.trim() : null,
      currency,
      discountAmount,
      taxAmount,
      totalAmount,
      status: "pending",
      processedBy: req.user.id,
    });

    // Get payment with details
    const paymentWithDetails = await Payment.findByPk(payment.id, {
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "description"],
          include: [
            {
              model: User,
              as: "teacher",
              attributes: ["id", "name", "email"],
            },
          ],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "role"],
        },
      ],
    });

    res.status(201).json({
      message: "پرداخت با موفقیت ایجاد شد",
      data: paymentWithDetails,
    });
  } catch (err) {
    next(err);
  }
};

// Update payment
const updatePayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, paymentDate, transactionId, receiptNumber, notes } =
      req.body;

    if (!id || isNaN(id)) {
      throw createHttpError(400, "شناسه پرداخت نامعتبر است");
    }

    const payment = await Payment.findByPk(id);
    if (!payment) {
      throw createHttpError(404, "پرداخت یافت نشد");
    }

    // Update payment
    await payment.update({
      status: status || payment.status,
      paymentDate: paymentDate ? new Date(paymentDate) : payment.paymentDate,
      transactionId: transactionId || payment.transactionId,
      receiptNumber: receiptNumber || payment.receiptNumber,
      notes: notes !== undefined ? notes.trim() : payment.notes,
    });

    // Get updated payment
    const updatedPayment = await Payment.findByPk(id, {
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "description"],
          include: [
            {
              model: User,
              as: "teacher",
              attributes: ["id", "name", "email"],
            },
          ],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "role"],
        },
      ],
    });

    res.json({
      message: "پرداخت با موفقیت به‌روزرسانی شد",
      data: updatedPayment,
    });
  } catch (err) {
    next(err);
  }
};

// Delete payment
const deletePayment = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      throw createHttpError(400, "شناسه پرداخت نامعتبر است");
    }

    const payment = await Payment.findByPk(id);
    if (!payment) {
      throw createHttpError(404, "پرداخت یافت نشد");
    }

    // Check payment status
    if (payment.status === "paid") {
      throw createHttpError(409, "امکان حذف پرداخت انجام‌شده وجود ندارد");
    }

    await payment.destroy();

    res.json({
      message: "پرداخت با موفقیت حذف شد",
    });
  } catch (err) {
    next(err);
  }
};

// Get user's payments
const getMyPayments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, paymentMethod, page = 1, limit = 10 } = req.query;

    const where = { userId };
    if (status) where.status = status;
    if (paymentMethod) where.paymentMethod = paymentMethod;

    const offset = (page - 1) * limit;

    const payments = await Payment.findAndCountAll({
      where,
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "description"],
          include: [
            {
              model: User,
              as: "teacher",
              attributes: ["id", "name", "email"],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      data: payments.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(payments.count / limit),
        totalItems: payments.count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get course payments
const getPaymentsByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { status, paymentMethod, page = 1, limit = 10 } = req.query;

    if (!courseId || isNaN(courseId)) {
      throw createHttpError(400, "شناسه دوره نامعتبر است");
    }

    const where = { courseId };
    if (status) where.status = status;
    if (paymentMethod) where.paymentMethod = paymentMethod;

    const offset = (page - 1) * limit;

    const payments = await Payment.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "role"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      data: payments.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(payments.count / limit),
        totalItems: payments.count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// Update payment status
const updatePaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, transactionId, receiptNumber } = req.body;

    if (!id || isNaN(id)) {
      throw createHttpError(400, "شناسه پرداخت نامعتبر است");
    }

    if (!status) {
      throw createHttpError(400, "وضعیت الزامی است");
    }

    const payment = await Payment.findByPk(id);
    if (!payment) {
      throw createHttpError(404, "پرداخت یافت نشد");
    }

    // Logic for status update
    if (payment.status === "paid" && status !== "paid") {
      throw createHttpError(
        409,
        "امکان تغییر وضعیت پرداخت انجام‌شده وجود ندارد"
      );
    }

    await payment.update({
      status,
      transactionId: transactionId || payment.transactionId,
      receiptNumber: receiptNumber || payment.receiptNumber,
      paymentDate: status === "paid" ? new Date() : payment.paymentDate,
    });

    res.json({
      message: "وضعیت پرداخت با موفقیت تغییر یافت",
      data: payment,
    });
  } catch (err) {
    next(err);
  }
};

// Get payment statistics
const getPaymentStats = async (req, res, next) => {
  try {
    const { courseId, startDate, endDate } = req.query;

    const where = {};
    if (courseId) where.courseId = courseId;
    if (startDate && endDate) {
      where.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const stats = await Payment.findAll({
      where,
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        [sequelize.fn("SUM", sequelize.col("totalAmount")), "totalAmount"],
      ],
      group: ["status"],
    });

    const totalPayments = await Payment.count({ where });
    const totalAmount = await Payment.sum("totalAmount", { where });
    const paidAmount = await Payment.sum("totalAmount", {
      where: { ...where, status: "paid" },
    });

    res.json({
      data: {
        stats,
        totalPayments,
        totalAmount: totalAmount || 0,
        paidAmount: paidAmount || 0,
        pendingAmount: (totalAmount || 0) - (paidAmount || 0),
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get payment report
const getPaymentReport = async (req, res, next) => {
  try {
    const {
      courseId,
      userId,
      status,
      startDate,
      endDate,
      format = "json",
    } = req.query;

    const where = {};
    const include = [
      {
        model: Course,
        as: "course",
        attributes: ["id", "title"],
        ...(courseId && { where: { id: courseId } }),
      },
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "email"],
        ...(userId && { where: { id: userId } }),
      },
    ];

    if (status) where.status = status;
    if (startDate && endDate) {
      where.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const payments = await Payment.findAll({
      where,
      include,
      order: [["created_at", "ASC"]],
    });

    if (format === "csv") {
      const csv = require("json2csv");
      const fields = [
        "id",
        "amount",
        "totalAmount",
        "status",
        "paymentMethod",
        "currency",
        "paymentDate",
        "created_at",
      ];
      const csvData = csv.parse(payments, { fields });

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=payment-report.csv"
      );
      return res.send(csvData);
    }

    res.json({
      data: payments,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  getMyPayments,
  getPaymentsByCourse,
  updatePaymentStatus,
  getPaymentStats,
  getPaymentReport,
};
