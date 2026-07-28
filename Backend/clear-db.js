// Development utility: removes all auction and bid records from MongoDB.
require("dotenv").config();
const mongoose = require("mongoose");
const Auction = require("./models/auction.model");
const Bid = require("./models/bid.model");

async function clearDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB...");

    const deleteAuctions = await Auction.deleteMany({});
    console.log(`Deleted ${deleteAuctions.deletedCount} auctions.`);

    const deleteBids = await Bid.deleteMany({});
    console.log(`Deleted ${deleteBids.deletedCount} bids.`);

    console.log("✅ All bidding items successfully removed!");
    process.exit(0);
  } catch (error) {
    console.error("Error clearing DB:", error);
    process.exit(1);
  }
}

clearDb();
