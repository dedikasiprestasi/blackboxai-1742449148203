const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const seedAdmin = require('./seedAdmin');

const connectDB = async () => {
    try {
        // Create an in-memory MongoDB instance
        const mongod = await MongoMemoryServer.create();
        const mongoUri = mongod.getUri();

        // Connect to the in-memory database
        const conn = await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Seed admin user
        await seedAdmin();

        // Handle process termination
        process.on('SIGTERM', async () => {
            await mongoose.connection.close();
            await mongod.stop();
            process.exit(0);
        });

    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;