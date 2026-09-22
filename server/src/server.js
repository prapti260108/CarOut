const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRouter = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api', apiRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', game: 'Car Out Parking Jam Server', timestamp: new Date().toISOString() });
});

// Start listening
app.listen(PORT, () => {
  console.log(`🚗 Car Out Server running on http://localhost:${PORT}`);
});
