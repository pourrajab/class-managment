const createError = require("http-errors");

function errorHandler(err, req, res, next) {
  console.error("Error:", err);

  // Sequelize errors
  if (err.name === "SequelizeValidationError") {
    const error = createError(400, "داده‌های ورودی نامعتبر است");
    error.details = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      message: error.message,
      details: error.details,
    });
  }

  if (err.name === "SequelizeUniqueConstraintError") {
    const error = createError(409, "داده تکراری است");
    error.details = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(409).json({
      success: false,
      message: error.message,
      details: error.details,
    });
  }

  if (err.name === "SequelizeForeignKeyConstraintError") {
    const error = createError(400, "مرجع نامعتبر است");
    return res.status(400).json({
      success: false,
      message: error.message,
      details: err.message,
    });
  }

  if (err.name === "SequelizeDatabaseError") {
    const error = createError(500, "خطای دیتابیس");
    return res.status(500).json({
      success: false,
      message: error.message,
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const error = createError(401, "توکن نامعتبر است");
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }

  if (err.name === "TokenExpiredError") {
    const error = createError(401, "توکن منقضی شده است");
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }

  // bcrypt errors
  if (err.name === "TypeError" && err.message.includes("data and hash")) {
    const error = createError(400, "داده‌های ورودی نامعتبر است");
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  // http-errors 
  if (err.status) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
      ...(process.env.NODE_ENV === "development" && {
        stack: err.stack,
      }),
    });
  }

  // General errors
  const error = createError(500, "خطای ناشناخته!");

  res.status(500).json({
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      details: err,
    }),
  });
}

module.exports = errorHandler;
