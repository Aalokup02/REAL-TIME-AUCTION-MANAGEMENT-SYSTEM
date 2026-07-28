// API routes: maps auction HTTP requests to the auction controller.
const router = require("express").Router();
const controller = require("../controllers/auction.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

console.log(controller)
router.post("/", protect, authorize("seller"), controller.createAuction);
router.put("/:id", protect, authorize("seller"), controller.updateAuction);
router.get("/", controller.getAllAuctions);
router.get("/:id", controller.getAuctionById);

module.exports = router;