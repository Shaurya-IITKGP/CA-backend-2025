//backend/routes/register.js

/* eslint-env node */
const express = require('express');
const { body, validationResult } = require('express-validator');
const { createRegistration, getAllRegistrations } = require('../models/registrationModel');
const ExcelJS = require('exceljs');

const router = express.Router();

// ✅ GET all registrations
router.get('/', async (req, res) => {
  try {
    const registrations = await getAllRegistrations();
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Export registrations as Excel
router.get('/export', async (req, res) => {
  if (req.query.token !== process.env.EXPORT_SECRET) {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const data = await getAllRegistrations();
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Registrations');

    sheet.columns = [
      { header: 'Name', key: 'fullName' },
      { header: 'Email', key: 'email' },
      { header: 'Phone', key: 'phone' },
      { header: 'College', key: 'college' },
      { header: 'Gender', key: 'gender' },
      { header: 'DOB', key: 'dob' },
      { header: 'City/State', key: 'cityState' },
      { header: 'Degree/Year', key: 'degreeYear' },
      { header: 'Heard About', key: 'heardAbout' },
      { header: 'Experience', key: 'hasExperience' },
      { header: 'Past Exp.', key: 'pastExperience' },
      { header: 'Motivation', key: 'motivation' },
      { header: 'Created At', key: 'created_at' }
    ];

    data.forEach(entry => sheet.addRow(entry));

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=registrations.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).send('Failed to export data');
  }
});

// ✅ POST with validation
router.post(
  '/',
  [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
    body('dob').isISO8601().withMessage('Invalid date of birth'),
    body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
    body('phone').matches(/^\d{10}$/).withMessage('Phone must be 10 digits'),
    body('college').trim().notEmpty().withMessage('College is required'),
    body('cityState').trim().notEmpty().withMessage('City/State is required'),
    body('degreeYear').trim().notEmpty().withMessage('Degree/Year is required'),
    body('heardAbout').trim().notEmpty().withMessage('This field is required'),
    body('hasExperience').isBoolean().withMessage('Experience must be true/false'),
    body('pastExperience').optional().trim().isLength({ max: 1000 }).withMessage('Too long'),
    body('motivation').trim().notEmpty().isLength({ max: 1000 }).withMessage('Required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation error',
        errors: errors.array(),
      });
    }

    try {
      const saved = await createRegistration(req.body);
      res.status(201).json(saved);
    } catch (err) {
      res.status(500).json({ message: 'Failed to save registration' });
    }
  }
);

module.exports = router;
