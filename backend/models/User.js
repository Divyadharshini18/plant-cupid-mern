const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    }, // stored as hashed value

    bio: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt feilds
  }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  } // if password is not modified, skip hashing

  const salt = await bcrypt.genSalt(10); // random data added to password before hashing , makes hashing slow by cost factor of 10 , ~2^10 = 1024 rounds
  this.password = await bcrypt.hash(this.password, salt);
});


userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
}; // Compare password during login and return true or false

module.exports = model("User", userSchema);