import express from 'express';
import {
    addProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getLowStock
} from '../controllers/productController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Routes accessible by all authenticated users
router.get('/get', getProducts);
router.get('/low-stock', getLowStock);
router.get('/get/:id', getProductById);

// Routes restricted to admin and manager only
router.post('/add', restrictTo('admin', 'manager'), addProduct);
router.put('/update/:id', restrictTo('admin', 'manager'), updateProduct);
router.delete('/delete/:id', restrictTo('admin', 'manager'), deleteProduct);

export default router;