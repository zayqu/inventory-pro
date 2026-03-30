import React, { useState, useEffect } from "react";
import axios from "axios";
import { MdSearch, MdAdd, MdEdit, MdDelete, MdClose, MdCategory, MdCheckCircle, MdError, MdInfo } from "react-icons/md";
import { FaPlus } from "react-icons/fa";

// Toast Notification Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: "bg-emerald-500",
    error: "bg-rose-500",
    info: "bg-blue-500"
  };

  const icons = {
    success: <MdCheckCircle className="w-5 h-5" />,
    error: <MdError className="w-5 h-5" />,
    info: <MdInfo className="w-5 h-5" />
  };

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-[60] animate-in slide-in-from-top-2 fade-in duration-300">
      <div className={`${styles[type]} text-white px-4 py-3 rounded-xl shadow-xl shadow-black/10 flex items-center gap-3`}>
        {icons[type]}
        <p className="text-sm font-medium flex-1">{message}</p>
        <button onClick={onClose} className="opacity-80 hover:opacity-100">
          <MdClose className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const Categories = () => {
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  
  // Toast state
  const [toast, setToast] = useState(null);

  // Show toast helper
  const showToast = (message, type = "info") => {
    setToast({ message, type });
  };

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  // Search filter
  useEffect(() => {
    const filtered = categories.filter(cat => {
      const name = (cat.categoryName || cat.name || "").toLowerCase();
      const desc = (cat.categoryDescription || cat.description || "").toLowerCase();
      return name.includes(searchQuery.toLowerCase()) || desc.includes(searchQuery.toLowerCase());
    });
    setFilteredCategories(filtered);
  }, [searchQuery, categories]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "https://inventory-pro-api-4jnw.onrender.com/api/category/get",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
          },
        }
      );

      if (response.data.success) {
        setCategories(response.data.categories || []);
        setFilteredCategories(response.data.categories || []);
      }
    } catch (error) {
      console.error("Error fetching categories", error);
      showToast("Failed to load categories", "error");
    }
  };

  // Add or update category
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      showToast("Category name is required", "error");
      return;
    }
    
    setLoading(true);

    try {
      let response;
      
      // Always send description (empty string if blank)
      const payload = {
        categoryName: categoryName.trim(),
        categoryDescription: categoryDescription ? categoryDescription.trim() : ""
      };

      if (editingCategory) {
        response = await axios.put(
          `https://inventory-pro-api-4jnw.onrender.com/api/category/edit/${editingCategory._id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
            },
          }
        );
      } else {
        response = await axios.post(
          "https://inventory-pro-api-4jnw.onrender.com/api/category/add",
          payload,
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
        showToast(
          editingCategory ? "Category updated successfully!" : "Category created successfully!", 
          "success"
        );
      }
    } catch (error) {
      console.error("Request failed", error);
      const errorMsg = error.response?.data?.message || (editingCategory ? "Failed to update category" : "Failed to create category");
      showToast(errorMsg, "error");
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
        `https://inventory-pro-api-4jnw.onrender.com/api/category/delete/${categoryId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
          },
        }
      );

      if (response.data.success) {
        fetchCategories();
        showToast("Category deleted successfully!", "success");
      }
    } catch (error) {
      console.error("Error deleting category", error);
      showToast("Failed to delete category", "error");
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedItems.length} categories?`)) return;
    
    try {
      await Promise.all(selectedItems.map(id => 
        axios.delete(`https://inventory-pro-api-4jnw.onrender.com/api/category/delete/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` },
        })
      ));
      setSelectedItems([]);
      setIsSelectionMode(false);
      fetchCategories();
      showToast(`${selectedItems.length} categories deleted!`, "success");
    } catch (error) {
      showToast("Failed to delete categories", "error");
    }
  };

  // Toggle selection
  const toggleSelection = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
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

  // Get initials for avatar
  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : "C";
  };

  // Generate consistent color based on string
  const getColorClass = (str) => {
    const colors = [
      "bg-emerald-500",
      "bg-blue-500", 
      "bg-violet-500",
      "bg-amber-500",
      "bg-rose-500",
      "bg-cyan-500",
      "bg-indigo-500",
      "bg-teal-500"
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 md:pb-0">
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Premium Header - Mobile Optimized */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="px-4 py-4 md:px-6 md:py-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Categories</h1>
              <p className="text-xs md:text-sm text-gray-500 mt-0.5">{filteredCategories.length} items</p>
            </div>
            <button
              onClick={openModal}
              className="flex items-center gap-1.5 bg-[#00c0c7] text-white px-3 py-2 md:px-4 md:py-2.5 rounded-xl hover:bg-[#00a8af] active:scale-95 transition-all shadow-lg shadow-[#00c0c7]/25"
            >
              <MdAdd size={18} />
              <span className="text-sm font-medium hidden sm:inline">Add New</span>
              <span className="text-sm font-medium sm:hidden">Add</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MdSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-10 py-3 bg-gray-100/50 border-0 rounded-2xl text-sm font-medium text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-[#00c0c7]/20 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <MdClose className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Selection Mode Bar */}
      {isSelectionMode && (
        <div className="sticky top-[140px] z-20 bg-[#00c0c7] text-white px-4 py-3 flex items-center justify-between animate-in slide-in-from-top-2">
          <span className="text-sm font-medium">{selectedItems.length} selected</span>
          <div className="flex gap-3">
            <button 
              onClick={() => {setSelectedItems([]); setIsSelectionMode(false);}}
              className="text-sm font-medium px-3 py-1 rounded-lg hover:bg-white/20 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleBulkDelete}
              className="text-sm font-medium px-3 py-1 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="px-4 py-4 md:px-6 md:py-6 max-w-5xl mx-auto">
        {filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <MdCategory className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {searchQuery ? "No matches found" : "No categories yet"}
            </h3>
            <p className="text-sm text-gray-500 max-w-xs mb-6">
              {searchQuery ? "Try adjusting your search terms" : "Get started by creating your first category"}
            </p>
            {!searchQuery && (
              <button
                onClick={openModal}
                className="inline-flex items-center gap-2 bg-[#00c0c7] text-white px-5 py-2.5 rounded-xl hover:bg-[#00a8af] active:scale-95 transition-all shadow-lg shadow-[#00c0c7]/25 font-medium"
              >
                <MdAdd size={18} />
                <span>Create Category</span>
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Desktop Header */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-gray-50/50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div className="col-span-5">Category</div>
              <div className="col-span-5">Description</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* List Items */}
            <div className="divide-y divide-gray-50">
              {filteredCategories.map((cat, index) => {
                const isSelected = selectedItems.includes(cat._id);
                const name = cat.categoryName || cat.name || "Unnamed";
                const desc = cat.categoryDescription || cat.description || "No description";
                const colorClass = getColorClass(name);
                
                return (
                  <div
                    key={cat._id || index}
                    onClick={() => isSelectionMode && toggleSelection(cat._id)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setIsSelectionMode(true);
                      toggleSelection(cat._id);
                    }}
                    className={`
                      group relative flex items-center gap-3 md:gap-4 p-4 md:px-6 md:py-4 
                      hover:bg-gray-50/80 active:bg-gray-100 transition-all duration-200
                      ${isSelected ? 'bg-[#00c0c7]/5 border-l-4 border-l-[#00c0c7]' : 'border-l-4 border-l-transparent'}
                    `}
                  >
                    {/* Selection Checkbox */}
                    {isSelectionMode && (
                      <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <div className={`
                          w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors
                          ${isSelected ? 'bg-[#00c0c7] border-[#00c0c7]' : 'border-gray-300'}
                        `}>
                          {isSelected && <MdClose className="w-3.5 h-3.5 text-white rotate-45" />}
                        </div>
                      </div>
                    )}

                    {/* Avatar */}
                    <div className={`
                      flex-shrink-0 w-12 h-12 md:w-10 md:h-10 rounded-xl ${colorClass} 
                      flex items-center justify-center text-white font-bold text-lg md:text-base shadow-sm
                    `}>
                      {getInitials(name)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 grid md:grid-cols-12 gap-1 md:gap-4 items-center">
                      <div className="md:col-span-5 min-w-0">
                        <h3 className="text-sm md:text-base font-semibold text-gray-900 truncate group-hover:text-[#00c0c7] transition-colors">
                          {name}
                        </h3>
                        <p className="md:hidden text-xs text-gray-500 truncate mt-0.5">{desc}</p>
                      </div>
                      
                      <p className="hidden md:block md:col-span-5 text-sm text-gray-500 truncate">
                        {desc}
                      </p>

                      {/* Desktop Actions */}
                      <div className="hidden md:flex md:col-span-2 justify-end gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEdit(cat); }}
                          className="p-2 text-gray-400 hover:text-[#00c0c7] hover:bg-[#00c0c7]/10 rounded-lg transition-all"
                        >
                          <MdEdit size={18} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(cat._id); }}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <MdDelete size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Mobile Actions */}
                    <div className="md:hidden flex items-center gap-1 text-gray-300">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(cat); }}
                        className="p-2 hover:text-[#00c0c7] active:scale-90 transition-all"
                      >
                        <MdEdit size={20} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(cat._id); }}
                        className="p-2 hover:text-red-500 active:scale-90 transition-all"
                      >
                        <MdDelete size={20} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button - Mobile */}
      <button
        onClick={openModal}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-[#00c0c7] text-white rounded-full shadow-xl shadow-[#00c0c7]/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40"
      >
        <MdAdd size={24} />
      </button>

      {/* Add/Edit Modal - CENTERED for mobile visibility */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">
                {editingCategory ? "Edit Category" : "New Category"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <MdClose className="text-gray-400 w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Soft Drinks"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#00c0c7]/20 focus:border-[#00c0c7] outline-none transition-all"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  placeholder="Brief description..."
                  rows="3"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#00c0c7]/20 focus:border-[#00c0c7] outline-none transition-all resize-none"
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                />
              </div>

              {/* Modal Footer - Always visible */}
              <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-[#00c0c7] text-white rounded-xl hover:bg-[#00a8af] transition-colors font-medium text-sm disabled:opacity-50 shadow-lg shadow-[#00c0c7]/25"
                >
                  {loading ? "Saving..." : editingCategory ? "Update" : "Create"}
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