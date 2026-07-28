// Controller: creates and retrieves auction payment records.
// controllers/payment.controller.js
const Payment = require("../models/payment.model");
const Auction = require("../models/auction.model");
const crypto  = require("crypto");

// ── POST /api/payments ──────────────────────────────────────────────────────
// Called by the winning buyer to pay after an auction closes.
exports.createPayment = async (req, res) => {
  try {
    const { auction_id, method, card_last4, upi_id } = req.body;

    if (!auction_id || !method) {
      return res.status(400).json({ msg: "auction_id and method are required" });
    }

    // 1. Fetch auction
    const auction = await Auction.findById(auction_id);
    if (!auction) return res.status(404).json({ msg: "Auction not found" });

    // 2. Must be closed
    if (auction.status !== "closed") {
      return res.status(400).json({ msg: "Auction is still active — payment not allowed yet" });
    }

    // 3. Caller must be the highest bidder
    if (!auction.highest_bidder_id) {
      return res.status(400).json({ msg: "No bids were placed on this auction" });
    }
    if (auction.highest_bidder_id.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Only the winning bidder can pay for this auction" });
    }

    // 4. Prevent double payment
    const existing = await Payment.findOne({ auction_id });
    if (existing) {
      if (existing.status === "paid") {
        return res.status(409).json({ msg: "Payment already completed for this auction", payment: existing });
      }
      // Allow re-attempt if previously failed
    }

    // 5. Method-specific validation
    if (method === "card" && (!card_last4 || card_last4.length !== 4)) {
      return res.status(400).json({ msg: "Provide last 4 digits of card" });
    }
    if (method === "upi" && !upi_id) {
      return res.status(400).json({ msg: "UPI ID is required" });
    }

    // 6. Simulate payment processing (always succeeds in dev)
    const txn_id = "TXN" + crypto.randomBytes(6).toString("hex").toUpperCase();

    // Upsert (update or create)
    const payment = await Payment.findOneAndUpdate(
      { auction_id },
      {
        auction_id,
        buyer_id:   req.user.id,
        seller_id:  auction.seller_id,
        amount:     auction.current_highest_bid,
        method,
        card_last4: method === "card" ? card_last4 : undefined,
        upi_id:     method === "upi"  ? upi_id     : undefined,
        status:     "paid",
        paid_at:    new Date(),
        txn_id
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({
      msg: "Payment successful",
      payment
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ── GET /api/payments/:auctionId ────────────────────────────────────────────
// Returns payment info for a given auction. Accessible by buyer or seller.
exports.getPaymentByAuction = async (req, res) => {
  try {
    const payment = await Payment.findOne({ auction_id: req.params.auctionId });
    if (!payment) return res.status(404).json({ msg: "No payment found for this auction" });

    // Only buyer or seller of this auction can see it
    const isBuyer  = payment.buyer_id.toString()  === req.user.id;
    const isSeller = payment.seller_id.toString() === req.user.id;
    if (!isBuyer && !isSeller) {
      return res.status(403).json({ msg: "Access denied" });
    }

    res.json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ── GET /api/payments/my ────────────────────────────────────────────────────
// Returns all payments made by the logged-in buyer.
exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment
      .find({ buyer_id: req.user.id })
      .populate("auction_id", "item_name category")
      .sort({ paid_at: -1 });

    res.json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
