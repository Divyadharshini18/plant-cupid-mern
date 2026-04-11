const UserPlant = require("../models/UserPlant");
const sendWaterReminderEmail = require("./sendWaterReminderEmail");

const isSameDay = (d1, d2) =>
  d1.getDate() === d2.getDate() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getFullYear() === d2.getFullYear();

const calculateReminder = (userPlant) => {
  const frequency = userPlant.plant.waterFrequency;

  if (!userPlant.wateredHistory.length) {
    return { daysLeft: 0 };
  }

  const lastWatered =
    userPlant.wateredHistory[userPlant.wateredHistory.length - 1].date;

  const nextWaterDate = new Date(
    lastWatered.getTime() + frequency * 24 * 60 * 60 * 1000
  );

  const diff = nextWaterDate - new Date();
  const daysLeft = Math.max(
    Math.ceil(diff / (1000 * 60 * 60 * 24)),
    0
  );

  return { daysLeft };
};

const checkWaterReminders = async () => {
  try {
    const plants = await UserPlant.find()
      .populate("user", "name email")
      .populate("plant", "name waterFrequency");

    for (const p of plants) {
      if (!p.user?.email || !p.plant) continue;

      const { daysLeft } = calculateReminder(p);

      if (daysLeft !== 0) continue;

      const today = new Date();

      if (
        p.lastReminderSent &&
        isSameDay(new Date(p.lastReminderSent), today)
      ) {
        continue;
      }

      await sendWaterReminderEmail({
        name: p.user.name,
        email: p.user.email,
        plantNickname: p.nickname,
        plantName: p.plant.name,
      });

      p.lastReminderSent = today;
      await p.save();
    }

    console.log("Reminder check completed");
  } catch (err) {
    console.error("Reminder error:", err.message);
  }
};

module.exports = checkWaterReminders;