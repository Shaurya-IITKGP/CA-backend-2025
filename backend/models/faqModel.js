// backend/models/faqModel.js

const pool = require('../db');

async function createFAQ({ name, phone, email, question }) {
  try {
    const [result] = await pool.query(
      "INSERT INTO faqs (name, phone, email, question) VALUES (?, ?, ?, ?)",
      [name, phone, email, question]
    );
    return { id: result.insertId, name, phone, email, question };
  } catch (err) {
    throw new Error('DB Error: Could not insert FAQ');
  }
}

async function getAllFAQs() {
  try {
    const [rows] = await pool.query("SELECT * FROM faqs ORDER BY created_at DESC");
    return rows;
  } catch (err) {
    throw new Error('DB Error: Could not fetch FAQs');
  }
}

module.exports = { createFAQ, getAllFAQs };
