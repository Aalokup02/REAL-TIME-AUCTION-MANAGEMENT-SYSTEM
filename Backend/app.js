// Express application: configures middleware and API route modules.
// app.js
const express = require("express");
const app = express();

app.use(express.json());

app.use("/api/users", require("./routes/user.routes"));
app.use("/api/auctions", require("./routes/auction.routes"));
app.use("/api/bids", require("./routes/bid.routes"));

module.exports = app;