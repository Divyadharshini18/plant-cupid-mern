const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Plant = require("./models/Plant");

dotenv.config();

// Simple list of sample plants to seed
const samplePlants = [
  {
    name: "Snake Plant",
    waterFrequency: 14,
    sunlight: "Low to bright indirect light",
    temperature: "15-29°C (60-85°F)",
    tips: ["Allow soil to dry out completely between waterings"],
  },
  {
    name: "Spider Plant",
    waterFrequency: 7,
    sunlight: "Bright, indirect light",
    temperature: "13-27°C (55-80°F)",
    tips: ["Keep soil slightly moist, but not soggy"],
  },
  {
    name: "Peace Lily",
    waterFrequency: 5,
    sunlight: "Low to medium indirect light",
    temperature: "18-27°C (65-80°F)",
    tips: ["Drooping leaves indicate it needs water", "Avoid direct sun"],
  },
  {
    name: "Aloe Vera",
    waterFrequency: 21,
    sunlight: "Bright, indirect or direct light",
    temperature: "13-27°C (55-80°F)",
    tips: ["Use well-draining soil", "Water deeply but infrequently"],
  },
  {
    name: "Pothos",
    waterFrequency: 7,
    sunlight: "Low to bright indirect light",
    temperature: "18-27°C (65-80°F)",
    tips: ["Trim vines to encourage bushier growth"],
  },
];

const seedPlants = async () => {
  try {
    await connectDB();

    console.log("Seeding initial plants...");

    for (const plantData of samplePlants) {
      const existing = await Plant.findOne({ name: plantData.name });
      if (existing) {
        console.log(`Skipping existing plant: ${plantData.name}`);
        continue;
      }

      const created = await Plant.create(plantData);
      console.log(`Added plant: ${created.name} (${created._id})`);
    }

    console.log("Plant seeding completed.");
  } catch (err) {
    console.error("Error while seeding plants:", err.message);
  } finally {
    // Always close mongoose connection so script exits cleanly
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
    process.exit(0);
  }
};

seedPlants();


