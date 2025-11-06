import Category from '../models/Category.js';

// Add Category
const addCategory = async (req, res) => {
  try {
    const { categoryName, categoryDescription } = req.body;

    const existingCategory = await Category.findOne({ categoryName });
    if (existingCategory) {
      return res
        .status(400)
        .json({ success: false, message: 'Category already exists' });
    }

    const newCategory = new Category({ categoryName, categoryDescription });
    await newCategory.save();

    return res
      .status(201)
      .json({ success: true, message: 'Category added successfully', category: newCategory });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get Categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    return res.status(200).json({ success: true, categories });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete Category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ success: false, message: 'Category not found' });
    return res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Edit Category
const editCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryName, categoryDescription } = req.body;

    const updated = await Category.findByIdAndUpdate(
      id,
      { categoryName, categoryDescription },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ success: false, message: 'Category not found' });

    return res.status(200).json({ success: true, message: 'Category updated successfully', category: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export { addCategory, getCategories, deleteCategory, editCategory };
