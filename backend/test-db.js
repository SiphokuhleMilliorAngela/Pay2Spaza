require('dotenv').config();
const mongoose = require('mongoose');

mongoose
  .connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DATABASE })
  .then(async () => {
    const c = mongoose.connection.collection('healthcheck');
    await c.insertOne({ ok: true, at: new Date() });
    console.log('write ok');
    await c.deleteMany({});
    process.exit(0);
  })
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  });