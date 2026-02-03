const { Schema, model } = require("mongoose");

const plantSchema = new Schema({
  name: { type: String, required: true }, // mandatory field 
  waterFrequency: Number,
  sunlight: String,
  temperature: String,
  tips: [String],
});

module.exports = model("Plant", plantSchema);