// API routes: maps bid HTTP requests to the bid controller.
const router = require("express").Router();
const controller = require("../controllers/bid.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

// GET /api/bids/my — logged-in user's bid history (must be before /:auctionId)
router.get("/my", protect, controller.getMyBids);

// GET /api/bids/auction/:auctionId — public bid history for an auction
router.get("/auction/:auctionId", controller.getBidsByAuction);

// POST /api/bids — place a bid (buyer only)
router.post("/", protect, authorize("buyer"), controller.placeBid);

module.exports = router;