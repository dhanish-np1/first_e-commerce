const mongoose = require('mongoose');

// Define the MongoDB connection URL. Replace 'your-database-uri' with your actual MongoDB URI.
const mongoURI = 'mongodb://127.0.0.1:27017/Animezone';

// Connect to the MongoDB database
mongoose.connect(mongoURI);

// Get the default connection
const db = mongoose.connection;

// Set up event listeners for the database connection

// When successfully connected
db.on('connected', () => {
  console.log('Connected to MongoDB');
});

// If the connection throws an error
db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// When the connection is disconnected
db.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// If Node.js process ends, close the Mongoose connection
process.on('SIGINT', () => {
  db.close(() => {
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  });
});
