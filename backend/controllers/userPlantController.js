const UserPlant = require("../models/UserPlant");
const Plant = require("../models/Plant");
const mongoose = require("mongoose");

exports.addUserPlant = async (req, res) => {
  const { plantId, nickname } = req.body;

  // 1️⃣ Validate input BEFORE DB call
  if (!mongoose.Types.ObjectId.isValid(plantId)) {
    return res.status(400).json({ message: "Invalid plant ID" });
  }

  if (nickname && nickname.length > 50) {
    return res.status(400).json({ message: "Nickname too long" });
  }

  try {
    // 2️⃣ Create user-plant relation
    const userPlant = await UserPlant.create({
      user: req.user,
      plant: plantId,
      nickname,
    });

    res.status(201).json(userPlant);
  } catch (error) {
    // 3️⃣ Handle duplicate entry
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Plant already added to your collection" });
    }

    // 4️⃣ Fallback error
    res.status(500).json({ message: error.message });
  }
};

exports.getUserPlants = async (req, res) => {
  const plants = await UserPlant.find({ user: req.user }).populate("plant");

  const response = plants.map((userPlant) => {
    const reminder = calculateReminder(userPlant);

    return {
      _id: userPlant._id,
      nickname: userPlant.nickname,
      plant: userPlant.plant,
      reminder,
      wateredHistory: userPlant.wateredHistory,
    };
  });

  res.json(response);
};

exports.waterPlant = async (req, res) => {
  const userPlant = await UserPlant.findById(req.params.id).populate("plant");

  if (!userPlant) {
    return res.status(404).json({ message: "Plant not found" });
  }

  if (userPlant.user.toString() !== req.user) {
    return res.status(403).json({ message: "Not authorized" });
  }

  const plant = userPlant.plant;

  if (userPlant.wateredHistory.length > 0) {
    const lastWatered =
      userPlant.wateredHistory[userPlant.wateredHistory.length - 1].date;

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

exports.updateUserPlant = async (req, res) => {
  const { nickname } = req.body;

  if (!nickname || nickname.trim() === "") {
    return res.status(400).json({ message: "Nickname cannot be empty" });
  }

  const userPlant = await UserPlant.findById(req.params.id);

  if (!userPlant) {
    return res.status(404).json({ message: "User plant not found" });
  }

  if (userPlant.user.toString() !== req.user) {
    return res.status(403).json({ message: "Not authorized" });
  }

  userPlant.nickname = nickname;
  await userPlant.save();

  res.json(userPlant);
};

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

const calculateReminder = (userPlant) => {
  const frequency = userPlant.plant.waterFrequencyDays;

  if (userPlant.wateredHistory.length === 0) {
    return {
      nextWaterDate: new Date(),
      daysLeft: 0,
    };
  }

  const lastWatered =
    userPlant.wateredHistory[userPlant.wateredHistory.length - 1].date;

  const nextWaterDate = new Date(
    lastWatered.getTime() + frequency * 24 * 60 * 60 * 1000
  );

  const diffMs = nextWaterDate - new Date();
  const daysLeft = Math.max(Math.ceil(diffMs / (1000 * 60 * 60 * 24)), 0);

  return { nextWaterDate, daysLeft };
};

