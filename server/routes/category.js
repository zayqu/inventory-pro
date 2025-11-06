import express from 'express';
import {
  addCategory,
  getCategories,
  deleteCategory,
  editCategory
} from '../controllers/categoryController.js';

const router = express.Router();

router.get('/get', getCategories);
router.post('/add', addCategory);
router.delete('/delete/:id', deleteCategory);
router.put('/edit/:id', editCategory);

export default router;
