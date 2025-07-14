const express = require("express");
const router = express.Router();
const {
  getCoursesHandler,
  addCourseHandler,
  getCourseByIdHandler,
  updateCourseHandler,
  deleteCourseHandler,
} = require("./course.controller");
const { AuthGuard } = require("../auth/auth.guard");
const permitHandler = require("../RBAC/rbac.middleware");

// Get all courses
router.get("/", AuthGuard, permitHandler("course:view"), getCoursesHandler);

// Get course by ID
router.get(
  "/:id",
  AuthGuard,
  permitHandler("course:view"),
  getCourseByIdHandler
);

// Create a new course
router.post("/", AuthGuard, permitHandler("course:create"), addCourseHandler);

// Update course
router.put(
  "/:id",
  AuthGuard,
  permitHandler("course:update"),
  updateCourseHandler
);

// Delete course
router.delete(
  "/:id",
  AuthGuard,
  permitHandler("course:delete"),
  deleteCourseHandler
);

module.exports = router;
