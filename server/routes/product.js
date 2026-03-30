import express from 'express';
import {
    addProduct,
    getProducts,
    updateProduct,
    deleteProduct
} from '../controllers/productController.js';
import authMiddleware, { restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Routes accessible by all authenticated users
router.get('/get', getProducts);

// Routes restricted to admin and manager only
router.post('/add', restrictTo('admin', 'manager'), addProduct);
router.put('/update/:id', restrictTo('admin', 'manager'), updateProduct);
router.delete('/delete/:id', restrictTo('admin', 'manager'), deleteProduct);

export default router;