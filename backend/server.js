const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve your frontend files
app.use(express.static(path.join(__dirname, '..')));

// Routes
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders',   require('./routes/orders'));

// Health check
app.get('/api', (req, res) => {
  res.json({ message: '🍱 CampusEats API is running!' });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log('✅ Server running at http://localhost:' + PORT);
});