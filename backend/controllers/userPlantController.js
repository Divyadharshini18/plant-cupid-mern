const UserPlant = require("../models/UserPlant");
const Plant = require("../models/Plant");

exports.addUserPlant = async (req, res) => {
  const { plantId, nickname } = req.body;

  const userPlant = await UserPlant.create({
    user: req.user,
    plant: plantId,
    nickname,
  });

  res.status(201).json(userPlant);
};

exports.getUserPlants = async (req, res) => {
  const plants = await UserPlant.find({ user: req.user }).populate("plant");
  res.json(plants);
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
