// backend/models/registrationModel.js

const pool = require('../db');

async function createRegistration(data) {
  try {
    const sql = `
      INSERT INTO registrations 
      (fullName, gender, dob, email, phone, college, cityState, degreeYear, heardAbout, hasExperience, pastExperience, motivation) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      data.fullName, data.gender, data.dob, data.email, data.phone,
      data.college, data.cityState, data.degreeYear, data.heardAbout,
      data.hasExperience, data.pastExperience, data.motivation
    ];
    const [result] = await pool.query(sql, values);
    return { id: result.insertId, ...data };
  } catch (err) {
    throw new Error('DB Error: Could not insert registration');
  }
}

async function getAllRegistrations() {
  try {
    const [rows] = await pool.query("SELECT * FROM registrations ORDER BY created_at DESC");
    return rows;
  } catch (err) {
    throw new Error('DB Error: Could not fetch registrations');
  }
}

module.exports = { createRegistration, getAllRegistrations };
