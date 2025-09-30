// Load environment variables first
require('dotenv').config();

// Fallback: Set environment variables directly if dotenv fails
if (!process.env.MONGO_URI) {
  process.env.MONGO_URI = 'mongodb://localhost:27017/insurance_management';
  process.env.JWT_SECRET = 'your_super_secure_jwt_secret_key_here_change_in_production';
  process.env.JWT_EXPIRES_IN = '7d';
  process.env.PORT = '5000';
  process.env.NODE_ENV = 'development';
  console.log('⚠️  Using fallback environment variables');
}

// Debug: Check if environment variables are loaded
console.log('Environment check:');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('PORT:', process.env.PORT || 'Using default 5000');

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to connect DB', err);
  process.exit(1);
});
