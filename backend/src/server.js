require("dotenv").config();

const app = require("./app");
const { connectStore } = require("./data/store");
const { seedMerchants } = require("./data/merchants");

const port = process.env.PORT || 3000;

async function start() {
  if (process.env.MONGODB_URI) {
    await connectStore(process.env.MONGODB_URI);
    await seedMerchants();
    console.log("MongoDB connected");
  } else {
    console.warn("MONGODB_URI is not set; using in-memory storage");
  }

  app.listen(port, () => {
    console.log(`Pay2Spaza backend running on port ${port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start Pay2Spaza backend", error);
  process.exitCode = 1;
});