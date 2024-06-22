const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  userId: String,
  token: String,
});

module.exports = mongoose.model("Token", tokenSchema);
