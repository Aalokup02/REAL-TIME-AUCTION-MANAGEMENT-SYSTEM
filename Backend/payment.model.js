// MongoDB model: defines the fields stored for an auction payment.
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  auction_id:   { type: mongoose.Schema.Types.ObjectId, ref: "Auction", required: true, unique: true },
  buyer_id:     { type: mongoose.Schema.Types.ObjectId, ref: "User",    required: true },
  seller_id:    { type: mongoose.Schema.Types.ObjectId, ref: "User",    required: true },
  amount:       { type: Number, required: true },

  // Payment method details (no real card data stored — masked only)
  method:       { type: String, enum: ["card", "upi", "netbanking"], required: true },
  card_last4:   { type: String },   // e.g. "4242"  — only for card method
  upi_id:       { type: String },   // e.g. "rahul@upi"

  status:       { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
  paid_at:      { type: Date },
  txn_id:       { type: String },   // simulated transaction ID
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
