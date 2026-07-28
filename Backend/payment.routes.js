// API routes: maps payment HTTP requests to the payment controller.
// routes/payment.routes.js
const router     = require("express").Router();
const controller = require("../controllers/payment.controller");
const { protect } = require("../middleware/auth.middleware");

// POST  /api/payments           — submit payment (winner only)
router.post("/", protect, controller.createPayment);

// GET   /api/payments/my        — all payments by logged-in buyer
router.get("/my", protect, controller.getMyPayments);

// GET   /api/payments/:auctionId — payment status for one auction
router.get("/:auctionId", protect, controller.getPaymentByAuction);

module.exports = router;
