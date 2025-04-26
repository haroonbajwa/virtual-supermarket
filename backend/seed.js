require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/superstore-layout', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Admin user credentials
const adminUser = {
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'admin123', // You should change this in production
  role: 'admin'
};

// Store owner credentials
const storeOwner = {
  name: 'Store Owner',
  email: 'owner@example.com',
  password: 'owner123', // You should change this in production
  role: 'owner'
};

// Function to seed the database
async function seedDatabase() {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminUser.email });
    if (!existingAdmin) {
      // Hash the password
      const passwordHash = await bcrypt.hash(adminUser.password, 10);
      
      // Create admin user
      const newAdmin = new User({
        name: adminUser.name,
        email: adminUser.email,
        passwordHash,
        role: adminUser.role
      });
      
      await newAdmin.save();
      console.log('Admin user created successfully!');
    } else {
      console.log('Admin user already exists.');
    }

    // Check if store owner already exists
    const existingOwner = await User.findOne({ email: storeOwner.email });
    if (!existingOwner) {
      // Hash the password
      const passwordHash = await bcrypt.hash(storeOwner.password, 10);
      
      // Create store owner user
      const newOwner = new User({
        name: storeOwner.name,
        email: storeOwner.email,
        passwordHash,
        role: storeOwner.role
      });
      
      await newOwner.save();
      console.log('Store owner created successfully!');
    } else {
      console.log('Store owner already exists.');
    }

    console.log('\nUse these credentials to log in:');
    console.log(`Admin: ${adminUser.email} / ${adminUser.password}`);
    console.log(`Store Owner: ${storeOwner.email} / ${storeOwner.password}`);
    console.log('\nMake sure to change these passwords in production!');

    // Disconnect from the database
    mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
