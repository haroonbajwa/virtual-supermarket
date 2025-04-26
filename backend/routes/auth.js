const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');
const router = express.Router();

// Register (admin only)
router.post('/register', auth, requireRole('admin'), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, passwordHash, role });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Public register route for initial setup
router.post('/register-initial', async (req, res) => {
  try {
    // Check if any users exist in the database
    const userCount = await User.countDocuments();
    
    // Only allow this route if no users exist
    if (userCount > 0) {
      return res.status(403).json({ 
        message: 'Initial setup already completed. Use admin account to create new users.' 
      });
    }
    
    const { name, email, password } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create admin user
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ 
      name, 
      email, 
      passwordHash, 
      role: 'admin' // Force role to be admin for initial user
    });
    
    await user.save();
    res.status(201).json({ 
      message: 'Admin user created successfully. You can now log in.'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    res.json({ 
      id: req.user._id, 
      name: req.user.name, 
      email: req.user.email, 
      role: req.user.role 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
