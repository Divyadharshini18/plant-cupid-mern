const mongoose = require("mongoose");

const userPlantSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    plant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plant",
      required: true,
    },
    lastWatered: {
      type: Date,
    },

    wateredHistory: [
      {
        date: {
          type: Date,
          required: true,
        },
      },
    ],

    nickname: String,
    lastWatered: Date,
    nextWatering: Date,
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserPlant", userPlantSchema);