const express = require("express");
const router = express.Router();
const sessionController = require("./session.controller");
const { AuthGuard } = require("../auth/auth.guard");
const permitHandler = require("../RBAC/rbac.middleware");
const { idValidation } = require("../../common/validation.middleware");

// Get all sessions
router.get(
  "/",
  AuthGuard,
  permitHandler("session:view"),
  sessionController.getAllSessions
);

// Get session by ID
router.get(
  "/:id",
  AuthGuard,
  permitHandler("session:view"),
  idValidation,
  sessionController.getSessionById
);

// Create a new session (teacher and admin only)
router.post(
  "/",
  AuthGuard,
  permitHandler("session:create"),
  sessionController.createSession
);

// Update session
router.put(
  "/:id",
  AuthGuard,
  permitHandler("session:update"),
  idValidation,
  sessionController.updateSession
);

// Delete session
router.delete(
  "/:id",
  AuthGuard,
  permitHandler("session:delete"),
  idValidation,
  sessionController.deleteSession
);

// Get sessions by course
router.get(
  "/course/:courseId",
  AuthGuard,
  permitHandler("session:view"),
  sessionController.getSessionsByCourse
);

// Update session status
router.patch(
  "/:id/status",
  AuthGuard,
  permitHandler("session:update"),
  idValidation,
  sessionController.updateSessionStatus
);

// Get session stats
router.get(
  "/stats",
  AuthGuard,
  permitHandler("session:view"),
  sessionController.getSessionStats
);

module.exports = router;
