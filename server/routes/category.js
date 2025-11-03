import express from 'express';
import { addCategory, getCategories } from '../controllers/categoryController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/add',authMiddleware, addCategory);
router.get('/',authMiddleware, getCategories);

export default router;
//compere this snippet from frontend/src/index.js: