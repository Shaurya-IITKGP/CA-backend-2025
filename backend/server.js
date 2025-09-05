// server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();

// Allowed origins (update with your actual frontend domain)
const allowedOrigins = [
  'http://localhost:5173',
  'https://your-domain.com',
  'https://c-ashaurya2025latest-we1m.vercel.app' // add Vercel frontend
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Connect to MongoDB (no deprecated options)
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Rate limiter (10 requests/minute per IP)
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many requests, please try again later.',
});
app.use(limiter);

// Routes
app.use('/api/register', require('./routes/register'));
app.use('/api/faq', require('./routes/faq'));

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


// middleware/auth.js
module.exports = (req, res, next) => {
  const token = req.headers['x-api-key'];
  if (token !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};
