// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Initialize the app
const app = express();

// Middleware
app.use(express.json()); // Allows us to parse JSON data in the body
app.use(cors({
    origin: '*', 
    credentials: true
}));        // Allows cross-origin requests from your React frontend

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log(' Successfully connected to MongoDB Atlas!');
  })
  .catch((error) => {
    console.error(' Error connecting to MongoDB:', error.message);
  });

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/users', require('./routes/users'));
app.use('/api/lists', require('./routes/lists'));

// Basic Test Route
app.get('/', (req, res) => {
  res.send('AniBox API is running!');
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(` Server is running on port ${PORT}`);
});