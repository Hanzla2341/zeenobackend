const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ['Logo', 'Social Media', 'Banner', 'Business Card', 'Brand Identity', 'Other'],
    required: true
  },
  description: { type: String, trim: true },
  imageUrl: { type: String, required: true },
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);
