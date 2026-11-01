const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env")
});


const app = require("./app");
const { connectStore } = require("./data/store");
const { seedMerchants } = require("./data/merchants");

const port = process.env.PORT || 3000;

async function start() {
  try {
    if (process.env.MONGODB_URI) {
      await connectStore(
        process.env.MONGODB_URI,
        process.env.MONGODB_DATABASE
      );
      await seedMerchants();
      console.log("MongoDB connected");
    } else if (process.env.MONGODB_REQUIRED === "true") {
      throw new Error("MONGODB_URI is not set in .env");
    } else {
      console.warn("MONGODB_URI is not set; using in-memory storage");
    }
  } catch (error) {
    if (process.env.MONGODB_REQUIRED === "true") {
      console.error("Failed to start Pay2Spaza backend:", error);
      process.exit(1);
    }

    console.warn("MongoDB unavailable; using in-memory storage");
  }

  app.listen(port, () => {
    console.log(`Pay2Spaza backend running on port ${port}`);
  });
}
start();