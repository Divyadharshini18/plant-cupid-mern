const { Schema, model } = require("mongoose");

const userPlantSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    plant: { type: Schema.Types.ObjectId, ref: "Plant", required: true }, // populate the dereferenced pointer here instead of simple plantId

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
        date: { type: Date, required: true },
      },
    ],

    lastReminderSent: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);
module.exports = model("UserPlant", userPlantSchema);