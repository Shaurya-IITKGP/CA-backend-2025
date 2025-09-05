/* eslint-env node */
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const FAQ = require('../models/FAQ');
const ExcelJS = require('exceljs');
// const auth = require('../middleware/auth'); // reuse same admin protection

// POST /api/faq – create FAQ entry
router.post('/', [
  body('name').trim().notEmpty(),
  body('phone').matches(/^\d{10}$/).withMessage('Phone must be 10 digits'),
  body('email').isEmail().normalizeEmail(),
  body('question').trim().notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation error', errors: errors.array() });
  }
  try {
    const faq = new FAQ(req.body);
    const saved = await faq.save();
    res.status(201).json(saved);
  } catch (err) {
    if(err)
        res.status(500).json({ message: 'Could not save FAQ' });
  }
});

// GET /api/faq/export – download as Excel (protected by ?token=)
router.get('/export', async (req, res) => {
  if (req.query.token !== process.env.EXPORT_SECRET) {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const data = await FAQ.find();
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('FAQs');

    sheet.columns = [
      { header: 'Name', key: 'name' },
      { header: 'Email', key: 'email' },
      { header: 'Phone', key: 'phone' },
      { header: 'Question', key: 'question' },
      { header: 'Created At', key: 'createdAt' }
    ];

    data.forEach(entry => sheet.addRow(entry.toObject()));

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=faqs.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    if(err)
        res.status(500).send('Failed to download');
  }
});

module.exports = router;
