const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
require('dotenv').config();
const uri = process.env.MONGO_URI;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected to ascendDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Sample route to test
app.get('/api/ping', (req, res) => {
  res.json({ message: 'Backend connected to MongoDB!' });
});

const PORT = 5174;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
