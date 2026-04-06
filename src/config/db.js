const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  await mongoose.connect(mongoUri);
  console.log("MongoDB connected successfully!");
};

module.exports = { connectDB };
