// Controller: reads bid history and accepts new buyer bids.
const Bid = require("../models/bid.model");
const Auction = require("../models/auction.model");

// GET /api/bids/my — all bids placed by the logged-in user
exports.getMyBids = async (req, res) => {
  try {
    const bids = await Bid.find({ bidder_id: req.user.id })
      .populate("auction_id", "item_name category status current_highest_bid end_time start_time highest_bidder_id seller_id")
      .sort({ timestamp: -1 });
    res.json(bids);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// GET /api/bids/auction/:auctionId — full bid history for one auction
exports.getBidsByAuction = async (req, res) => {
  try {
    const bids = await Bid.find({ auction_id: req.params.auctionId })
      .populate("bidder_id", "name")
      .sort({ bid_amount: -1 });
    res.json(bids);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.placeBid = async (req, res) => {
  try {
    const { auction_id, bid_amount } = req.body;

    // 🔍 1. Basic validation
    if (!auction_id || !bid_amount) {
      return res.status(400).json({ msg: "All fields required" });
    }

    if (bid_amount <= 0) {
      return res.status(400).json({ msg: "Invalid bid amount" });
    }

    // 🔍 2. Find auction
    const auction = await Auction.findById(auction_id);

    if (!auction) {
      return res.status(404).json({ msg: "Auction not found" });
    }

    // 🔍 3. Check auction status
    if (auction.status !== "active") {
      return res.status(400).json({ msg: "Auction is not active" });
    }

    // 🔍 4. Time validation
    const now = new Date();
    if (now > auction.end_time) {
      return res.status(400).json({ msg: "Auction has already ended" });
    }

    // 🔍 5. Prevent seller from bidding
    if (auction.seller_id.toString() === req.user.id) {
      return res.status(403).json({ msg: "Seller cannot bid" });
    }

    // 🔍 6. Check bid value
    if (bid_amount <= auction.current_highest_bid) {
      return res.status(400).json({ msg: "Bid must be higher than current highest bid" });
    }

    // 🔥 7. Create bid
    const bid = await Bid.create({
      auction_id,
      bidder_id: req.user.id,
      bid_amount
    });

    // 🔥 8. Update auction
    auction.current_highest_bid = bid_amount;
    auction.highest_bidder_id = req.user.id;
    await auction.save();

    // 🔥 9. Emit socket event (REAL-TIME)
    const io = req.app.get("io");

    io.to(auction_id.toString()).emit("newBid", {
      _id: bid._id,
      auction_id,
      bid_amount,
      bidder_id: req.user.id,
      timestamp: bid.timestamp || new Date()
    });

    // ✅ 10. Response
    res.status(201).json({
      msg: "Bid placed successfully",
      bid
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};