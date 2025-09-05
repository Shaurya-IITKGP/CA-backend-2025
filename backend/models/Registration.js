// backend/routes/register.js
const Registration = require('../models/Registration');

const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
  fullName: String,
  gender: String,
  dob: String,
  email: String,
  phone: String,
  college: String,
  cityState: String,
  degreeYear: String,
  heardAbout: String,
  hasExperience: String,
  pastExperience: String,
  motivation: String,
}, { timestamps: true });

module.exports = mongoose.model('Registration', RegistrationSchema);
