const express = require("express");
const router = express.Router();
const {
  createRoleHandler,
  createPermissionHandler,
  assignPermissionToRoleHandler,
  getRolesHandler,
  getPermissionsHandler,
  getRolePermissionsHandler,
} = require("./rbac.service");
const { AuthGuard } = require("../auth/auth.guard");
const {
  createRoleValidation,
  createPermissionValidation,
  assignPermissionToRoleValidation,
} = require("./rbac.validation");

// Create a new role
router.post("/roles", AuthGuard, createRoleValidation, createRoleHandler);

// Get list of roles
router.get("/roles", AuthGuard, getRolesHandler);

// Create a new permission
router.post(
  "/permissions",
  AuthGuard,
  createPermissionValidation,
  createPermissionHandler
);

// Get list of permissions
router.get("/permissions", AuthGuard, getPermissionsHandler);

// Assign permission to role
router.post(
  "/roles/assign-permissions",
  AuthGuard,
  assignPermissionToRoleValidation,
  assignPermissionToRoleHandler
);

// Get permissions of a role
router.get("/roles/:roleId/permissions", AuthGuard, getRolePermissionsHandler);

module.exports = router;
