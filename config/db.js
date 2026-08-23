const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    if (process.env.USE_MEMORY_DB === 'true') {
      console.log('⚡ Initializing embedded MongoDB engine...');
      mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      console.log(`✅ Embedded MongoDB running at: ${mongoUri}`);
    } else {
      console.log(`🌐 Connecting to MongoDB Atlas cloud database...`);
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`🚀 MongoDB Atlas Connected: ${conn.connection.host} / Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    
    // If Atlas connection fails (e.g. IP whitelist / network restriction), fallback gracefully
    if (process.env.USE_MEMORY_DB !== 'true') {
      console.warn('⚠️ Switching to fallback embedded MongoDB engine...');
      try {
        mongoServer = await MongoMemoryServer.create();
        const fallbackUri = mongoServer.getUri();
        const conn = await mongoose.connect(fallbackUri);
        console.log(`✅ Fallback Embedded MongoDB Connected: ${conn.connection.host}`);
      } catch (fallbackErr) {
        console.error(`❌ Database connection failed completely: ${fallbackErr.message}`);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

module.exports = { connectDB };
