const mongoose = require("mongoose"); // mongoose - works between JS and MongoDB

const connectDB = async () => { // async functions are functions that return a promise and make the JS wait inside it using await only the function the other events takes place, await only can be used in the async functions
  try {
    await mongoose.connect(process.env.MONGO_URI); // wait until mongoose connects to the MongoDB using the connection string stored in environment variable MONGO_URI
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1); 
  }
};

module.exports = connectDB; // exporting the connectDB function to be used in other files

// process refers to the current Node.js process
// exit(1) is used to exit the process with a failure code and 0 for sucess

// promise are object that will available later in the future that allows JS to continue running and come back when task finshes
// promise has three states: pending, fulfilled, rejected