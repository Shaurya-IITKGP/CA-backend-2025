// backend/exports/faqExport.js

/* eslint-env node */
const db = require('../db');
const ExcelJS = require('exceljs');

async function exportFAQs(filePath = 'faqs.xlsx') {
  try {
    const [rows] = await db.query('SELECT * FROM faqs');

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('FAQs');

    sheet.columns = Object.keys(rows[0] || {}).map((key) => ({
      header: key,
      key: key,
    }));

    rows.forEach((row) => sheet.addRow(row));

    await workbook.xlsx.writeFile(filePath);
    console.log(`✅ FAQs exported successfully to ${filePath}`);
  } catch (err) {
    console.error('❌ Error exporting FAQs:', err);
  }
}

module.exports = { exportFAQs };
