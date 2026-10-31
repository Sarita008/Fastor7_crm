const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongodInstance = null;

const connectDB = async () => {
  const customUri = process.env.MONGO_URI;

  if (customUri) {
    try {
      console.log(`Attempting connection to MongoDB at: ${customUri}`);
      const conn = await mongoose.connect(customUri, {
        serverSelectionTimeoutMS: 4000
      });
      console.log(` MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (err) {
      console.warn(`! Failed to connect to configured MONGO_URI (${err.message}). Falling back to In-Memory MongoDB...`);
    }
  }

  // Fallback to in-memory MongoDB so backend always works zero-config!
  try {
    console.log('Starting In-Memory MongoDB Server...');
    mongodInstance = await MongoMemoryServer.create();
    const uri = mongodInstance.getUri();
    const conn = await mongoose.connect(uri);
    console.log(` In-Memory MongoDB Connected successfully: ${uri}`);
  } catch (error) {
    console.error(` Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
  } catch (err) {
    console.error('Error disconnecting DB:', err);
  }
};

module.exports = { connectDB, disconnectDB };

