// backend/routes/register.js

/* eslint-env node */
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Registration = require('../models/Registration');
const ExcelJS = require('exceljs');
// const auth = require('../middleware/auth'); // Optional for PATCH/DELETE protection

// GET all registrations
router.get('/', async (req, res) => {
  try {
    const registrations = await Registration.find();
    res.json(registrations);
  } catch (err) {
    if(err)
      res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/register/export → Export to Excel (protected via query secret)
router.get('/export', async (req, res) => {
  const token = req.query.secret;
  if (token === process.env.EXPORT_SECRET) {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const data = await Registration.find();
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
    ];

    data.forEach(entry => {
      sheet.addRow(entry.toObject());
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=registrations.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    if(err)
      res.status(500).send('Failed to export data');
  }
});

// GET one registration by ID
router.get('/:id', getRegistration, (req, res) => {
  res.json(res.registration);
});

// POST with validation and sanitization
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
      const registration = new Registration(req.body);
      const saved = await registration.save();
      res.status(201).json(saved);
    } catch (err) {
      if(err)
        res.status(500).json({ message: 'Failed to save registration' });
    }
  }
);

// PATCH update registration by ID (optionally protected with auth)
router.patch('/:id', /* auth, */ getRegistration, async (req, res) => {
  Object.keys(req.body).forEach(key => {
    if (req.body[key] != null) {
      res.registration[key] = req.body[key];
    }
  });

  try {
    const updated = await res.registration.save();
    res.json(updated);
  } catch (err) {
    if(err)
      res.status(400).json({ message: 'Update failed' });
  }
});

// DELETE registration by ID (optionally protected with auth)
router.delete('/:id', /* auth, */ getRegistration, async (req, res) => {
  try {
    await res.registration.deleteOne();
    res.json({ message: 'Deleted registration' });
  } catch (err) {
    if(err)
      res.status(500).json({ message: 'Delete failed' });
  }
});

// Middleware to get registration by ID
async function getRegistration(req, res, next) {
  let registration;
  try {
    registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ message: 'Not found' });
    }
  } catch (err) {
    if(err)
      return res.status(400).json({ message: 'Invalid ID format' });
  }

  res.registration = registration;
  next();
}

module.exports = router;
