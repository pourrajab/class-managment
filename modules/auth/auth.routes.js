const express = require("express");
const router = express.Router();
const {
  signupHandler,
  loginHandler,
  refreshHandler,
  logoutHandler,
  logoutAllHandler,
  getProfileHandler,
  updateProfileHandler,
  changePasswordHandler,
} = require("./auth.controller");
const { AuthGuard } = require("./auth.guard");
const { signupValidation, loginValidation, changePasswordValidation } = require("../../common/validation.middleware");

// Public routes
router.post("/signup", signupValidation, signupHandler);
router.post("/login", loginValidation, loginHandler);
router.post("/refresh", refreshHandler);

// Logout
router.post("/logout", AuthGuard, logoutHandler);
router.post("/logout-all", AuthGuard, logoutAllHandler);

// Profile
router.get("/profile", AuthGuard, getProfileHandler);
router.put("/profile", AuthGuard, updateProfileHandler);

// Change password
router.put("/change-password", AuthGuard, changePasswordHandler);

module.exports = router;
