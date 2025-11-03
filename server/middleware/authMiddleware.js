import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check header presence
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token missing after Bearer' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.id) {
      return res.status(401).json({ success: false, message: 'Invalid token structure' });
    }

    // Find user
    const user = await User.findById(decoded.id).select('-password'); // exclude password
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = user; // attach user to request
    next();
  } catch (error) {
    console.error('Error in authMiddleware:', error);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please log in again.' });
    }

    return res.status(500).json({ success: false, message: 'Internal server error in middleware' });
  }
};

export default authMiddleware;
