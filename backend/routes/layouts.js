const express = require('express');
const Layout = require('../models/Layout');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');
const router = express.Router();

// Get layouts (admin gets all, owner gets theirs)
router.get('/', auth, async (req, res) => {
  try {
    let layouts;
    if (req.user.role === 'admin') {
      layouts = await Layout.find().populate('owner', 'name email');
    } else {
      layouts = await Layout.find({ owner: req.user._id });
    }
    res.json(layouts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get layout by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const layout = await Layout.findById(req.params.id);
    if (!layout) {
      return res.status(404).json({ message: 'Layout not found' });
    }
    
    // Check if user has access to this layout
    if (req.user.role !== 'admin' && layout.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    res.json(layout);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create layout (admin only, assign to owner)
router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const { name, aisles, ownerId } = req.body;
    const owner = await User.findById(ownerId);
    if (!owner) {
      return res.status(400).json({ message: 'Owner not found' });
    }
    
    const layout = new Layout({ name, aisles, owner: owner._id });
    await layout.save();
    res.status(201).json(layout);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update layout (admin or owner of the layout)
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, aisles } = req.body;
    const layout = await Layout.findById(req.params.id);
    
    if (!layout) {
      return res.status(404).json({ message: 'Layout not found' });
    }
    
    // Check if user has access to update this layout
    if (req.user.role !== 'admin' && layout.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    layout.name = name;
    layout.aisles = aisles;
    await layout.save();
    
    res.json(layout);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete layout (admin only)
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const layout = await Layout.findByIdAndDelete(req.params.id);
    if (!layout) {
      return res.status(404).json({ message: 'Layout not found' });
    }
    res.json({ message: 'Layout deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign layout to a different owner (admin only)
router.patch('/:id/assign', auth, requireRole('admin'), async (req, res) => {
  try {
    const { ownerId } = req.body;
    const owner = await User.findById(ownerId);
    if (!owner) {
      return res.status(400).json({ message: 'Owner not found' });
    }
    
    const layout = await Layout.findByIdAndUpdate(
      req.params.id,
      { owner: owner._id },
      { new: true }
    ).populate('owner', 'name email');
    
    if (!layout) {
      return res.status(404).json({ message: 'Layout not found' });
    }
    
    res.json(layout);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
