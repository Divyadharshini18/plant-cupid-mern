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

    nickname: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    wateredHistory: [
      {
        date: {
          type: Date,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

// Prevent duplicate plant per user
userPlantSchema.index({ user: 1, plant: 1 }, { unique: true });

module.exports = mongoose.model("UserPlant", userPlantSchema);