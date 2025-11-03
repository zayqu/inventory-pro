import Category from '../models/Category.js';

// Add a new category
const addCategory = async (req, res) => {
  try {
    console.log("Incoming category data:", req.body);
    console.log("addCategory called with:", req.body);

    const { categoryName, categoryDescription } = req.body;

    // Check if the category already exists
    const existingCategory = await Category.findOne({ categoryName });
    if (existingCategory) {
      return res
        .status(400)
        .json({ success: false, message: 'Category already exists' });
    }

    // Create a new category
    const newCategory = new Category({
      categoryName,
      categoryDescription,
    });

    await newCategory.save();
    return res
      .status(201)
      .json({ success: true, message: 'Category added successfully' });
  } catch (error) {
    console.error('Error adding category:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Server error' });
  }
};

// Get all categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    return res.status(200).json({ success: true, categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Server error in getting categories' });
  }
};

// ✅ Export both functions
export { addCategory, getCategories };
