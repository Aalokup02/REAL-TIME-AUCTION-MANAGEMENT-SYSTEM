// Application entry point: starts Express, Socket.IO, and the MongoDB connection.
// server.js
const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
require("dotenv").config();

const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Auto-close expired auctions every minute
require("./utils/utils.cron");

// ✅ Create HTTP server
const server = http.createServer(app);

// ✅ Attach Socket.io
const io = new Server(server, {
  cors: { origin: "*" }
});

// ✅ Make io available everywhere
app.set("io", io);

// ✅ Socket logic
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinAuction", (auctionId) => {
    socket.join(auctionId);
    console.log("Joined room:", auctionId);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("DB Connected"))
  .catch(err => console.log(err));

// Routes
app.use("/api/users",    require("./routes/user.routes"));
app.use("/api/auctions", require("./routes/auction.routes"));
app.use("/api/bids",     require("./routes/bid.routes"));
app.use("/api/payments", require("./routes/payment.routes")); // ✅ NEW

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
