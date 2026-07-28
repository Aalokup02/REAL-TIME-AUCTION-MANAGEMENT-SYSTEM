// MongoDB model: defines the fields stored for an auction listing.
const mongoose = require("mongoose");

const auctionSchema = new mongoose.Schema({
  seller_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  item_name: String,
  description: String,
  category: String, 
  image_url: String,
  start_time: Date,
  end_time: Date,
  current_highest_bid: { type: Number, default: 0 },
  highest_bidder_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, enum: ["active", "closed"], default: "active" }
});

module.exports = mongoose.model("Auction", auctionSchema);