const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // MongoDB connection without deprecated options
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected...");
  } catch (err) {
    console.error(err);
    process.exit(1); // Exit if connection fails
  }
};

module.exports = connectDB;
