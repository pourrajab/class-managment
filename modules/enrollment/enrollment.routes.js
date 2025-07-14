const express = require("express");
const router = express.Router();
const enrollmentController = require("./enrollment.controller");
const { AuthGuard } = require("../auth/auth.guard");
const permitHandler = require("../RBAC/rbac.middleware");
const { idValidation } = require("../../common/validation.middleware");

// Get all enrollments (admin only)
router.get(
  "/",
  AuthGuard,
  permitHandler("enrollment:view"),
  enrollmentController.getAllEnrollments
);

// Get enrollment by ID
router.get(
  "/:id",
  AuthGuard,
  permitHandler("enrollment:view"),
  idValidation,
  enrollmentController.getEnrollmentById
);

// Enroll in a course (student)
router.post(
  "/",
  AuthGuard,
  permitHandler("enrollment:create"),
  enrollmentController.createEnrollment
);

// Update enrollment (admin only)
router.put(
  "/:id",
  AuthGuard,
  permitHandler("enrollment:update"),
  idValidation,
  enrollmentController.updateEnrollment
);

// Delete enrollment (admin only)
router.delete(
  "/:id",
  AuthGuard,
  permitHandler("enrollment:delete"),
  idValidation,
  enrollmentController.deleteEnrollment
);

// Get enrollments by course
router.get(
  "/course/:courseId",
  AuthGuard,
  permitHandler("enrollment:view"),
  enrollmentController.getEnrollmentsByCourse
);

// Get my enrollments (student)
router.get(
  "/my",
  AuthGuard,
  permitHandler("enrollment:view"),
  enrollmentController.getMyEnrollments
);

// Update enrollment status
router.patch(
  "/:id/status",
  AuthGuard,
  permitHandler("enrollment:update"),
  idValidation,
  enrollmentController.updateEnrollmentStatus
);

// Get enrollment stats
router.get(
  "/stats",
  AuthGuard,
  permitHandler("enrollment:view"),
  enrollmentController.getEnrollmentStats
);

module.exports = router;
