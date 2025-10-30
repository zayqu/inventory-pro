import mongoose from "mongoose"

const categorySchema = new mongoose.Schema({
    categoryName: {type: String, required: true},
    categoryDescription: {type: String, required: true},
});

const CategoryModels = mongoose.model("Category", categorySchema);
export default CategoryModels;