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
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174', 
    process.env.FRONTEND_URL // Add your Vercel frontend URL here or in .env
  ].filter(Boolean),
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const fs = require('fs');

// Ensure uploads folder exists (useful for local development)
const uploadDir = path.join(__dirname, 'uploads');
if (process.env.NODE_ENV !== 'production') {
  if (!fs.existsSync(uploadDir)) {
    try { fs.mkdirSync(uploadDir, { recursive: true }); } catch (e) {}
  }
}

// Static files for serving uploaded images
app.use('/uploads', express.static(uploadDir));

// Routes
app.use('/api/contact', require('./routes/contact'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Zeenat Portfolio API is running', env: process.env.NODE_ENV });
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

app.get("/", (req, res) => {
  res.send("zeenat portfolio backend running ✔");
});

// ✅ RUN LOCALLY ONLY (Avoid calling app.listen on Vercel)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running locally on http://localhost:${PORT}`);
  });
}

// ✅ EXPORT for Vercel
module.exports = app;