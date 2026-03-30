import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import { MdCategory, MdAdd, MdEdit, MdDelete, MdClose } from "react-icons/md";

const Categories = () => {
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/category/get",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
          },
        }
      );

      if (response.data.success) {
        setCategories(response.data.categories || []);
      }
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };

  // Add or update category
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      
      if (editingCategory) {
        // UPDATE existing category - FIXED URL HERE
        response = await axios.put(
          `http://localhost:3000/api/category/edit/${editingCategory._id}`,
          { categoryName, categoryDescription },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
            },
          }
        );
      } else {
        // CREATE new category
        response = await axios.post(
          "http://localhost:3000/api/category/add",
          { categoryName, categoryDescription },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
            },
          }
        );
      }

      if (response.data.success) {
        setCategoryName("");
        setCategoryDescription("");
        setIsModalOpen(false);
        setEditingCategory(null);
        fetchCategories();
        alert(editingCategory ? "Category updated successfully!" : "Category added successfully!");
      }
    } catch (error) {
      console.error("Request failed", error);
      alert(editingCategory ? "Error updating category. Please try again." : "Error adding category. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // DELETE category
  const handleDelete = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:3000/api/category/delete/${categoryId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
          },
        }
      );

      if (response.data.success) {
        fetchCategories();
        alert("Category deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting category", error);
      alert("Error deleting category. Please try again.");
    }
  };

  // OPEN edit modal
  const handleEdit = (category) => {
    setEditingCategory(category);
    setCategoryName(category.categoryName || category.name || "");
    setCategoryDescription(category.categoryDescription || category.description || "");
    setIsModalOpen(true);
  };

  const openModal = () => {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryDescription("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCategoryName("");
    setCategoryDescription("");
    setEditingCategory(null);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your product categories</p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 bg-[#00c0c7] text-white px-4 py-2.5 rounded-lg hover:bg-[#00a8af] transition-colors shadow-md"
        >
          <MdAdd size={18} />
          <span className="font-medium">Add Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="text-gray-400 text-5xl mb-4 flex justify-center">
            <MdCategory size={64} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No categories yet</h3>
          <p className="text-gray-500 mb-6">Get started by creating your first category</p>
          <button
            onClick={openModal}
            className="inline-flex items-center gap-2 bg-[#00c0c7] text-white px-6 py-3 rounded-lg hover:bg-[#00a8af] transition-colors"
          >
            <MdAdd size={18} />
            <span>Create Category</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="w-12 h-12 bg-[#00c0c7]/10 rounded-lg flex items-center justify-center">
                  <MdCategory size={28} className="text-[#00c0c7]" />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(cat)}
                    className="p-2 text-gray-400 hover:text-[#00c0c7] hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <MdEdit size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(cat._id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <MdDelete size={18} />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 truncate">
                {cat.categoryName || cat.name}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-2">
                {cat.categoryDescription || cat.description}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MdClose size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Soft Drinks"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00c0c7] focus:border-[#00c0c7] outline-none transition-all"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Brief description of the category"
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00c0c7] focus:border-[#00c0c7] outline-none transition-all resize-none"
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  required
                />
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-[#00c0c7] text-white rounded-lg hover:bg-[#00a8af] transition-colors font-medium disabled:opacity-50"
                >
                  {loading ? "Saving..." : editingCategory ? "Update" : "Add Category"}
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