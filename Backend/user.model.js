// MongoDB model: defines the fields stored for an account.
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["buyer", "seller"] }
});

module.exports = mongoose.model("User", userSchema);