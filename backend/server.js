const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/superstore-layout', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const connection = mongoose.connection;
connection.once('open', () => {
    console.log('MongoDB database connection established successfully');
});

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const layoutRoutes = require('./routes/layouts');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/layouts', layoutRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});
