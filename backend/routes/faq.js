// backend/routes/faq.js


const express = require('express');
const { body, validationResult } = require('express-validator');
const { createFAQ, getAllFAQs } = require('../models/faqModel');
const ExcelJS = require('exceljs');
const router = express.Router();

router.post('/', [
  body('name').trim().notEmpty(),
  body('phone').matches(/^\d{10}$/),
  body('email').isEmail().normalizeEmail(),
  body('question').trim().notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const faq = await createFAQ(req.body);
    res.status(201).json(faq);
  } catch (err) {
    res.status(500).json({ message: 'Could not save FAQ' });
  }
});

router.get('/export', async (req, res) => {
  if (req.query.token !== process.env.EXPORT_SECRET) return res.status(403).json({ message: 'Access denied' });

  try {
    const data = await getAllFAQs();
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('FAQs');

    sheet.columns = [
      { header: 'Name', key: 'name' },
      { header: 'Email', key: 'email' },
      { header: 'Phone', key: 'phone' },
      { header: 'Question', key: 'question' },
      { header: 'Created At', key: 'created_at' }
    ];

    data.forEach(entry => sheet.addRow(entry));

    res.setHeader('Content-Disposition', 'attachment; filename=faqs.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).send('Failed to export');
  }
});

module.exports = router;
