const express = require("express");
const router = express.Router();
const {
  getAllUsersHandler,
  getUserByIdHandler,
  createUserHandler,
  updateUserHandler,
  deleteUserHandler,
} = require("./user.controller");
const { AuthGuard } = require("../auth/auth.guard");
const permitHandler = require("../RBAC/rbac.middleware");
const {
  createUserValidation,
  updateUserValidation,
  idValidation,
} = require("../../common/validation.middleware");

// Get all users (admin only)
router.get("/", AuthGuard, permitHandler("user view"), getAllUsersHandler);

// Get user by ID
router.get(
  "/:id",
  AuthGuard,
  permitHandler("user view"),
  idValidation,
  getUserByIdHandler
);

// Create a new user
router.post(
  "/",
  AuthGuard,
  permitHandler("user create"),
  createUserValidation,
  createUserHandler
);

// Update user
router.put(
  "/:id",
  AuthGuard,
  permitHandler("user update"),
  createUserValidation,
  updateUserHandler
);

// Delete user
router.delete(
  "/:id",
  AuthGuard,
  permitHandler("user delete"),
  idValidation,
  deleteUserHandler
);

module.exports = router;
