const express = require("express");
const router = express.Router();
const paymentController = require("./payment.controller");
const { AuthGuard } = require("../auth/auth.guard");
const permitHandler = require("../RBAC/rbac.middleware");
const { idValidation } = require("../../common/validation.middleware");

// Get all payments
router.get(
  "/",
  AuthGuard,
  permitHandler("payment:view"),
  paymentController.getAllPayments
);

// Get payment by ID
router.get(
  "/:id",
  AuthGuard,
  permitHandler("payment:view"),
  idValidation,
  paymentController.getPaymentById
);

// Create a new payment
router.post(
  "/",
  AuthGuard,
  permitHandler("payment:create"),
  paymentController.createPayment
);

// Update payment
router.put(
  "/:id",
  AuthGuard,
  permitHandler("payment:update"),
  idValidation,
  paymentController.updatePayment
);

// Delete payment
router.delete(
  "/:id",
  AuthGuard,
  permitHandler("payment:delete"),
  idValidation,
  paymentController.deletePayment
);

// Get my payments
router.get(
  "/my",
  AuthGuard,
  permitHandler("payment:view"),
  paymentController.getMyPayments
);

// Get payments by course
router.get(
  "/course/:courseId",
  AuthGuard,
  permitHandler("payment:view"),
  paymentController.getPaymentsByCourse
);

// Update payment status
router.patch(
  "/:id/status",
  AuthGuard,
  permitHandler("payment:update"),
  idValidation,
  paymentController.updatePaymentStatus
);

// Get payment stats
router.get(
  "/stats",
  AuthGuard,
  permitHandler("payment:view"),
  paymentController.getPaymentStats
);

// Get payment report
router.get(
  "/report",
  AuthGuard,
  permitHandler("payment:view"),
  paymentController.getPaymentReport
);

module.exports = router;
