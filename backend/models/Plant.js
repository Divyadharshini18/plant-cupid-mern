const mongoose = require("mongoose");

const plantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  waterFrequency: Number, // days
  sunlight: String,
  temperature: String,
  tips: [String],
});

module.exports = mongoose.model("Plant", plantSchema);
