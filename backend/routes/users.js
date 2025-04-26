const express = require('express');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');
const router = express.Router();

// Get all users (admin only)
router.get('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID (admin only)
router.get('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user (admin only)
router.put('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { name, email, role },
      { new: true }
    ).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
