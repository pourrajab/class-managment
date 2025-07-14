const express = require("express");
const router = express.Router();
const attendanceController = require("./attendance.controller");
const { AuthGuard } = require("../auth/auth.guard");
const permitHandler = require("../RBAC/rbac.middleware");
const { idValidation } = require("../../common/validation.middleware");

// Get all attendance records
router.get(
  "/",
  AuthGuard,
  permitHandler("attendance:view"),
  attendanceController.getAllAttendance
);

// Get attendance by ID
router.get(
  "/:id",
  AuthGuard,
  permitHandler("attendance:view"),
  idValidation,
  attendanceController.getAttendanceById
);

// Create a new attendance record
router.post(
  "/",
  AuthGuard,
  permitHandler("attendance:create"),
  attendanceController.createAttendance
);

// Update attendance
router.put(
  "/:id",
  AuthGuard,
  permitHandler("attendance:update"),
  idValidation,
  attendanceController.updateAttendance
);

// Delete attendance
router.delete(
  "/:id",
  AuthGuard,
  permitHandler("attendance:delete"),
  idValidation,
  attendanceController.deleteAttendance
);

// Get attendance by session
router.get(
  "/session/:sessionId",
  AuthGuard,
  permitHandler("attendance:view"),
  attendanceController.getAttendanceBySession
);

// Get my attendance
router.get(
  "/my",
  AuthGuard,
  permitHandler("attendance:view"),
  attendanceController.getMyAttendance
);

// Get attendance report
router.get(
  "/report",
  AuthGuard,
  permitHandler("attendance:view"),
  attendanceController.getAttendanceReport
);

// Create bulk attendance
router.post(
  "/bulk",
  AuthGuard,
  permitHandler("attendance:create"),
  attendanceController.createBulkAttendance
);

module.exports = router;
