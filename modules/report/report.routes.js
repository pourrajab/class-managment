const express = require("express");
const router = express.Router();
const reportController = require("./report.controller");
const { AuthGuard } = require("../auth/auth.guard");
const permitHandler = require("../RBAC/rbac.middleware");
const { idValidation } = require("../../common/validation.middleware");

// System overview report (admin only)
router.get("/overview", AuthGuard, permitHandler("report:view"), reportController.getSystemOverview);

// Course report
router.get("/course", AuthGuard, permitHandler("report:view"), reportController.getCourseReport);

// Student report
router.get("/student", AuthGuard, permitHandler("report:view"), reportController.getStudentReport);

// Financial report
router.get("/financial", AuthGuard, permitHandler("report:view"), reportController.getFinancialReport);

// Attendance report
router.get("/attendance", AuthGuard, permitHandler("report:view"), reportController.getAttendanceReport);

// Teacher performance report
router.get("/teacher-performance", AuthGuard, permitHandler("report:view"), reportController.getTeacherPerformanceReport);

module.exports = router;
