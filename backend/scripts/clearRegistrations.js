// scripts/clearRegistrations.js
const mongoose = require('mongoose');
require('dotenv').config();
const Registration = require('../models/Registration');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const result = await Registration.deleteMany({});
    console.log(`Deleted ${result.deletedCount} registrations`);

    mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
})();
