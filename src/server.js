const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "./.env") });

const { connectDB } = require("./config/db");
const app = require("./app");

const PORT = process.env.PORT || 5000; // Or 5000 if not successful

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log("Server running....");
    });
  } catch (error) {
    console.error("Failed to start server: ", error);
    process.exit(1);
  }
};

startServer();
