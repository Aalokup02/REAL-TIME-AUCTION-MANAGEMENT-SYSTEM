// MongoDB model: defines the fields stored for a placed bid.
const mongoose = require("mongoose");

const bidSchema = new mongoose.Schema({
  auction_id: { type: mongoose.Schema.Types.ObjectId, ref: "Auction" },
  bidder_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  bid_amount: Number,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Bid", bidSchema);