const mongoose = require('mongoose');

const FAQSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  question: String
}, { timestamps: true });

module.exports = mongoose.model('FAQ', FAQSchema);
