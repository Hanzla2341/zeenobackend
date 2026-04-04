const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

// GET /api/projects - Public: get all projects
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const query = category && category !== 'All' ? { category } : {};
    const projects = await Project.find(query).sort({ order: 1, createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/projects - Admin: add project with image upload
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Image is required' });
    
    const { title, category, description, featured, order } = req.body;
    
    // Store image as Base64 in the database to work on Vercel's read-only system
    const b64 = req.file.buffer.toString('base64');
    const imageUrl = `data:${req.file.mimetype};base64,${b64}`;
    
    const project = new Project({ 
      title, 
      category, 
      description, 
      imageUrl, 
      featured: featured === 'true', 
      order: Number(order) || 0 
    });
    
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    console.error("🔴 Upload error:", err);
    res.status(500).json({ message: err.message || 'Server error during upload' });
  }
});

// PUT /api/projects/:id - Admin: update project
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, category, description, featured, order } = req.body;
    const update = { 
      title, 
      category, 
      description, 
      featured: featured === 'true', 
      order: Number(order) || 0 
    };
    
    if (req.file) {
      const b64 = req.file.buffer.toString('base64');
      update.imageUrl = `data:${req.file.mimetype};base64,${b64}`;
    }
    
    const project = await Project.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    console.error("🔴 Update error:", err);
    res.status(500).json({ message: 'Server error during update' });
  }
});

// DELETE /api/projects/:id - Admin: delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
