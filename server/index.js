import express from 'express';
import cors from 'cors';
import connectDB from './db/connection.js';
import authRoutes from './routes/auth.js';
import categoryRoutes from './routes/category.js';

const app = express();

// Enable CORS for all origins (you can restrict to your frontend IP if needed)
app.use(cors({
  origin: '*' 
}));

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/category', categoryRoutes);

// Use a fallback port if process.env.PORT is not set
const PORT = process.env.PORT || 3000;

// Listen on all network interfaces so phone can access
app.listen(PORT, '0.0.0.0', () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});
