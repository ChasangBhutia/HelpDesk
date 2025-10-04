const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const URI = process.env.MONGODB_URI;
        await mongoose.connect(URI);
        console.log("MongoDB connected successfully.");
    } catch (err) {
        console.error(`Error connecting mongoDB: ${err.message}`);
        process.exit(1);
    }
}

module.exports = connectDB;