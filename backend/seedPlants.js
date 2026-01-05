const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Plant = require("./models/Plant");

dotenv.config();

// Target list of sample plants to seed
// Names are important; we use them as a natural key (case-insensitive)
const samplePlants = [
  {
    name: "Snake Plant",
    waterFrequency: 14,
    sunlight: "Low to bright indirect light",
    temperature: "15-29°C (60-85°F)",
    tips: ["Allow soil to dry out completely between waterings"],
  },
  {
    name: "Rose",
    waterFrequency: 3,
    sunlight: "Full sun",
    temperature: "15-26°C (60-80°F)",
    tips: ["Plant in well-draining soil", "Deadhead spent blooms to encourage flowering"],
  },
  {
    name: "Tulip",
    waterFrequency: 5,
    sunlight: "Full sun to partial shade",
    temperature: "Cool to mild climates",
    tips: ["Best grown from bulbs", "Allow foliage to die back naturally"],
  },
  {
    name: "Aloe Vera",
    waterFrequency: 21,
    sunlight: "Bright, indirect or direct light",
    temperature: "13-27°C (55-80°F)",
    tips: ["Use well-draining soil", "Water deeply but infrequently"],
  },
  {
    name: "Money Plant",
    waterFrequency: 7,
    sunlight: "Low to bright indirect light",
    temperature: "18-27°C (65-80°F)",
    tips: ["Avoid direct harsh sunlight", "Can be grown in water or soil"],
  },
];

const seedPlants = async () => {
  try {
    await connectDB();

    console.log("Seeding initial plants...");
    console.log(`Using MONGO_URI: ${process.env.MONGO_URI ? "[SET]" : "[NOT SET - CHECK .env]"}`);

    // Fetch existing plants once and build a case-insensitive name set
    const existingPlants = await Plant.find(
      {
        name: {
          $in: samplePlants.map((p) => p.name),
        },
      },
      { name: 1 }
    );

    console.log(`Found ${existingPlants.length} existing plants in database`);

    const existingNameSet = new Set(
      existingPlants.map((p) => p.name.toLowerCase())
    );

    const toInsert = samplePlants.filter(
      (p) => !existingNameSet.has(p.name.toLowerCase())
    );

    console.log(`Plants to insert: ${toInsert.length}`);

    if (toInsert.length === 0) {
      console.log("All sample plants already exist. Nothing to insert.");
    } else {
      console.log(`Inserting ${toInsert.length} new plants...`);
      const inserted = await Plant.insertMany(toInsert);
      inserted.forEach((doc) => {
        console.log(`✓ Inserted plant: ${doc.name} (${doc._id})`);
      });
    }

    // Log skipped plants (case-insensitive)
    samplePlants.forEach((p) => {
      if (existingNameSet.has(p.name.toLowerCase())) {
        console.log(`⊘ Skipped existing plant: ${p.name}`);
      }
    });

    // VERIFICATION: Count total plants in database after seeding
    const totalPlants = await Plant.find();
    console.log(`\n=== SEEDING VERIFICATION ===`);
    console.log(`Total plants in database: ${totalPlants.length}`);
    console.log(`Expected plants: ${samplePlants.length}`);
    
    if (totalPlants.length >= samplePlants.length) {
      console.log("✓ SUCCESS: Database has all expected plants");
    } else {
      console.warn(`⚠ WARNING: Database has ${totalPlants.length} plants, expected ${samplePlants.length}`);
    }

    // List all plant names for verification
    console.log("\nAll plants in database:");
    totalPlants.forEach((plant, index) => {
      console.log(`  ${index + 1}. ${plant.name} (${plant._id})`);
    });

    console.log("\nPlant seeding completed.");
  } catch (err) {
    console.error("Error while seeding plants:", err.message);
    console.error(err.stack);
  } finally {
    // Always close mongoose connection so script exits cleanly
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
    process.exit(0);
  }
};

seedPlants();