const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const serverless = require('serverless-http');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (⚠️ limited support on Vercel)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/contact', require('../routes/contact'));
app.use('/api/projects', require('../routes/projects'));
app.use('/api/admin', require('../routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Zeenat Portfolio API is running' });
});

// MongoDB connection (IMPORTANT: connect once)
let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
  console.log("✅ MongoDB connected");
}

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// ❌ REMOVE app.listen()

// ✅ EXPORT for Vercel
module.exports = serverless(app);