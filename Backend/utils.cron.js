// utils/cron.js
const cron = require("node-cron");
const Auction = require("../models/auction.model");
const { sendWinEmail } = require("./mailer");

cron.schedule("* * * * *", async () => {
  const now = new Date();

  try {
    const endedAuctions = await Auction.find({ end_time: { $lt: now }, status: "active" })
      .populate("highest_bidder_id"); // Populate winner info

    for (const auction of endedAuctions) {
      // Mark as closed
      auction.status = "closed";
      await auction.save();

      // If there is a winning bidder, trigger the mailer
      if (auction.highest_bidder_id && auction.highest_bidder_id.email) {
        const user = auction.highest_bidder_id;
        await sendWinEmail(
          user.email,
          user.name,
          auction.item_name,
          auction.current_highest_bid,
          auction.end_time
        );
      }
    }
  } catch (err) {
    console.error("Error in auto-close cron:", err);
  }
});