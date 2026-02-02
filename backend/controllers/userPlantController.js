const UserPlant = require("../models/UserPlant");
const Plant = require("../models/Plant");
const mongoose = require("mongoose");

/* -------------------- ADD USER PLANT -------------------- */
exports.addUserPlant = async (req, res) => {
  const { plantId, nickname } = req.body;

  if (!mongoose.Types.ObjectId.isValid(plantId)) {
    return res.status(400).json({ message: "Invalid plant ID" });
  }

  if (!nickname || typeof nickname !== "string") {
    return res.status(400).json({ message: "Nickname is required" });
  }

  const trimmedNickname = nickname.trim();

  if (!trimmedNickname) {
    return res.status(400).json({ message: "Nickname cannot be empty" });
  }

  if (trimmedNickname.length > 50) {
    return res.status(400).json({ message: "Nickname too long" });
  }

  try {
    const exists = await UserPlant.findOne({
      user: req.user,
      nickname: { $regex: new RegExp(`^${trimmedNickname}$`, "i") },
    });

    if (exists) {
      return res
        .status(409)
        .json({ message: "You already have a plant with this nickname" });
    }

    const userPlant = await UserPlant.create({
      user: req.user,
      plant: plantId,
      nickname: trimmedNickname,
    });

    res.status(201).json(userPlant);
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: "You already have a plant with this nickname" });
    } // 11000 is duplicate key error code

    res.status(500).json({ message: err.message });
  }
};

/* -------------------- GET USER PLANTS -------------------- */
exports.getUserPlants = async (req, res) => {
  const plants = await UserPlant.find({ user: req.user }).populate("plant");

  const response = plants.map((up) => ({
    _id: up._id,
    nickname: up.nickname,
    plant: up.plant,
    reminder: calculateReminder(up),
    wateredHistory: up.wateredHistory,
  }));

  res.json(response);
};

/* -------------------- WATER PLANT -------------------- */
exports.waterPlant = async (req, res) => {
  const userPlant = await UserPlant.findById(req.params.id).populate("plant");

  if (!userPlant) {
    return res.status(404).json({ message: "Plant not found" });
  }

  if (userPlant.user.toString() !== req.user) {
    return res.status(403).json({ message: "Not authorized" });
  }

  const { plant, wateredHistory } = userPlant;

  if (wateredHistory.length) {
    const lastWatered = wateredHistory[wateredHistory.length - 1].date;
    const nextAllowed = new Date(
      lastWatered.getTime() +
        plant.waterFrequencyDays * 24 * 60 * 60 * 1000
    );

    if (new Date() < nextAllowed) {
      return res.status(400).json({
        message: "Plant watered recently 🌱",
        nextWaterDate: nextAllowed,
      });
    }
  }

  userPlant.wateredHistory.push({ date: new Date() });
  await userPlant.save();

  res.json({
    message: "Plant watered successfully 💧",
    nextWaterInDays: plant.waterFrequencyDays,
  });
};

/* -------------------- UPDATE USER PLANT -------------------- */
exports.updateUserPlant = async (req, res) => {
  const { nickname } = req.body;

  if (!nickname || !nickname.trim()) {
    return res.status(400).json({ message: "Nickname cannot be empty" });
  }

  const userPlant = await UserPlant.findById(req.params.id);

  if (!userPlant) {
    return res.status(404).json({ message: "User plant not found" });
  }

  if (userPlant.user.toString() !== req.user) {
    return res.status(403).json({ message: "Not authorized" });
  }

  userPlant.nickname = nickname.trim();
  await userPlant.save();

  res.json(userPlant);
};

/* -------------------- DELETE USER PLANT -------------------- */
exports.deleteUserPlant = async (req, res) => {
  const userPlant = await UserPlant.findById(req.params.id);

  if (!userPlant) {
    return res.status(404).json({ message: "User plant not found" });
  }

  if (userPlant.user.toString() !== req.user) {
    return res.status(403).json({ message: "Not authorized" });
  }

  await userPlant.deleteOne();
  res.json({ message: "Plant removed from your collection 🪴" });
};

/* -------------------- REMINDER HELPER -------------------- */
const calculateReminder = (userPlant) => {
  const frequency = userPlant.plant.waterFrequencyDays;

  if (!userPlant.wateredHistory.length) {
    return { nextWaterDate: new Date(), daysLeft: 0 };
  }

  const lastWatered =
    userPlant.wateredHistory[userPlant.wateredHistory.length - 1].date;

  const nextWaterDate = new Date(
    lastWatered.getTime() + frequency * 24 * 60 * 60 * 1000
  );

  const diffMs = nextWaterDate - new Date();
  const daysLeft = Math.max(
    Math.ceil(diffMs / (1000 * 60 * 60 * 24)),
    0
  );

  return { nextWaterDate, daysLeft };
};