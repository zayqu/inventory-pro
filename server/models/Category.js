import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
    trim: true,
  },
  categoryDescription: {
    type: String,
    required: false,
    default: "",
    trim: true,
  },
}, {
  timestamps: true,
});

const Category = mongoose.model("Category", categorySchema);

export default Category;