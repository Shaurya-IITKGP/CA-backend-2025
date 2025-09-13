//backend/scripts/exportData.js

/* eslint-env node */
const { exportFAQs } = require('../exports/faqExport');
const { exportRegistrations } = require('../exports/registrationExport');

(async () => {
  await exportFAQs('faqs.xlsx');
  await exportRegistrations('registrations.xlsx');
})();
