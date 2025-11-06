import React, { useState, useEffect } from "react";
import axios from "axios";

const Categories = () => {
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editCategory, setEditCategory] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get("http://localhost:3000/api/category/get", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
          },
        });
        setCategories(response.data.categories || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Add new category
  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:3000/api/category/add",
        { categoryName, categoryDescription },
        { headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` } }
      );
      if (response.data.success) {
        setCategories((prev) => [
          ...prev,
          { _id: Date.now(), categoryName, categoryDescription },
        ]);
        setCategoryName("");
        setCategoryDescription("");
        alert("Category added successfully!");
      } else {
        alert("Error adding category. Please try again.");
      }
    } catch (err) {
      console.error("Error adding category:", err);
      alert("Error adding category. Please try again.");
    }
  };

  // Delete category
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      const response = await axios.delete(`http://localhost:3000/api/category/delete/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` },
      });
      if (response.data.success) {
        setCategories((prev) => prev.filter((cat) => cat._id !== id));
        alert("Category deleted successfully!");
      } else {
        alert("Failed to delete category.");
      }
    } catch (err) {
      console.error("Error deleting category:", err);
      alert("Failed to delete category.");
    }
  };

  // Open edit modal
  const openEditModal = (category) => {
    setEditCategory(category);
    setCategoryName(category.categoryName);
    setCategoryDescription(category.categoryDescription);
    setShowModal(true);
  };

  // Update category
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:3000/api/category/update/${editCategory._id}`,
        { categoryName, categoryDescription },
        { headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` } }
      );
      if (response.data.success) {
        setCategories((prev) =>
          prev.map((cat) =>
            cat._id === editCategory._id
              ? { ...cat, categoryName, categoryDescription }
              : cat
          )
        );
        setShowModal(false);
        setEditCategory(null);
        setCategoryName("");
        setCategoryDescription("");
        alert("Category updated successfully!");
      } else {
        alert("Failed to update category.");
      }
    } catch (err) {
      console.error("Error updating category:", err);
      alert("Failed to update category.");
    }
  };

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-[#00c0c7] text-center md:text-left">
        Category Management
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Add Category Form */}
        <div className="bg-white shadow-lg rounded-xl p-6 md:w-1/3 border-t-4 border-[#00c0c7]">
          <h2 className="text-xl font-bold mb-6 text-[#00c0c7] text-center">
            Add Category
          </h2>
          <form className="space-y-4" onSubmit={handleAdd}>
            <input
              type="text"
              value={categoryName}
              placeholder="Category Name"
              className="border border-gray-300 w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c0c7]"
              onChange={(e) => setCategoryName(e.target.value)}
              required
            />
            <input
              type="text"
              value={categoryDescription}
              placeholder="Category Description"
              className="border border-gray-300 w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c0c7]"
              onChange={(e) => setCategoryDescription(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-[#00c0c7] text-white p-3 font-semibold hover:bg-[#00a0a5] transition"
            >
              Add Category
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="lg:w-2/3 space-y-4">
          {loading ? (
            <p className="text-gray-500 text-center animate-pulse">Loading categories...</p>
          ) : error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : categories.length === 0 ? (
            <p className="text-gray-500 text-center">No categories found.</p>
          ) : (
            <div className="space-y-4">
              {categories.map((cat, index) => (
                <div
                  key={cat._id}
                  className="bg-white shadow-md rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-t-4 border-[#00c0c7] hover:bg-[#00c0c7]/10 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="font-semibold text-gray-700 sm:w-10">{index + 1}.</span>
                    <span className="font-medium text-gray-900">{cat.categoryName}</span>
                    <span className="text-gray-600 hidden sm:block">{cat.categoryDescription}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
                    <button
                      className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition w-full sm:w-auto"
                      onClick={() => openEditModal(cat)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition w-full sm:w-auto"
                      onClick={() => handleDelete(cat._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-11/12 md:w-1/3 shadow-lg relative">
            <h2 className="text-xl font-bold mb-4 text-[#00c0c7] text-center">
              Edit Category
            </h2>
            <form className="space-y-4" onSubmit={handleUpdate}>
              <input
                type="text"
                value={categoryName}
                className="border border-gray-300 w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c0c7]"
                onChange={(e) => setCategoryName(e.target.value)}
                required
              />
              <input
                type="text"
                value={categoryDescription}
                className="border border-gray-300 w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c0c7]"
                onChange={(e) => setCategoryDescription(e.target.value)}
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#00c0c7] text-white p-3 font-semibold hover:bg-[#00a0a5] transition"
                >
                  Update
                </button>
                <button
                  type="button"
                  className="w-full rounded-lg bg-gray-400 text-white p-3 font-semibold hover:bg-gray-500 transition"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
