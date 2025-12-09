require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDatabase } = require('./db');

const { authRouter } = require('./routes/auth');
const { rfpRouter } = require('./routes/rfp');
const { productRouter } = require('./routes/product');
const { proposalRouter } = require('./routes/proposal');

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRouter);
app.use('/api/rfp', rfpRouter);
app.use('/api/products', productRouter);
app.use('/api/proposals', proposalRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'TenderPilot API is running' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

async function main() {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API endpoint: http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();
