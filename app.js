require("dotenv").config();
const express = require("express");
const sequelize = require("./config/sequelize.config");
const {
  User,
  Course,
  Session,
  Enrollment,
  Attendance,
  Payment,
  RefreshToken,
  initAssociations,
} = require("./config/models.initial");
const authRoutes = require("./modules/auth/auth.routes");
const userRoutes = require("./modules/user/user.routes");
const courseRoutes = require("./modules/course/course.routes");
const sessionRoutes = require("./modules/session/session.routes");
const enrollmentRoutes = require("./modules/enrollment/enrollment.routes");
const attendanceRoutes = require("./modules/attendance/attendance.routes");
const paymentRoutes = require("./modules/payment/payment.routes");
const reportRoutes = require("./modules/report/report.routes");
const errorHandler = require("./common/error.middleware");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reports", reportRoutes);

// 404 handler
app.use((req, res, next) => {
  const error = new Error("آدرس مورد نظر پیدا نشد");
  error.status = 404;
  next(error);
});

// Error handling middleware
app.use(errorHandler);

// Database connection and server startup
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");

    // Initialize model associations
    await initAssociations();

    // Start server
    app.listen(PORT, () => {
      console.log(` Server is running on port ${PORT}`);
      console.log(` API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error(" Unable to start server:", error);
  }
}

startServer();
