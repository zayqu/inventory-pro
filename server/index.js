import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './db/connection.js';
import authRoutes from './routes/auth.js';
import categoryRoutes from './routes/category.js';

const app = express();

// CORS (frontend access)
app.use(cors({
  origin: 'https://inventory-pro-two.vercel.app',
  credentials: true
}));

app.use(express.json());

// ✅ Health check route
app.get('/', (req, res) => {
  res.send('API is running');
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/category', categoryRoutes);

const PORT = process.env.PORT || 3000;

// ✅ Start server only after DB connects
const startServer = async () => {
  try {
    await connectDB();
    console.log('Database connected');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();