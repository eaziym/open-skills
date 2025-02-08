const mongoose = require("mongoose");

const connectDB = async () => {
  const DB_NAME = "open-skills";
  const DB_URI = `mongodb+srv://${process.env.DATABASE_USERNAME}:${process.env.DB_PASSWORD}@open-skills.iqwh0.mongodb.net/${DB_NAME}?retryWrites=true&w=majority&appName=open-skills`;
  try {
    const connectionInstance = await mongoose.connect(DB_URI);
    console.log(`\nMONGO DB CONNECTED !!`);
  } catch (err) {
    console.log(`MONGODB CONNECTION ERROR: ${err}`);
    process.exit(1);
  }
};

module.exports = connectDB;
