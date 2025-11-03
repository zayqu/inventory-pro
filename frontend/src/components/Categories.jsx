import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Categories = () => {
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Failed to load categories. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:3000/api/category/add",
        { categoryName, categoryDescription },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
          },
        }
      );

      if (response.data.success) {
        setCategoryName("");
        setCategoryDescription("");
        alert("Category added successfully!");
      } else {
        console.error("Error adding category", response.data);
        alert("Error adding category. Please try again.");
      }
    } catch (error) {
      console.error("Error adding category:", error);
      alert("Error adding category. Please try again.");
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-8">Category Management</h1>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="bg-white shadow-md rounded-lg p-4">
          <div className="text-center text-xl font-bold mb-4">
            <h2 className="text-center text-xl font-bold mb-4">Add Category</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <input
                  type="text"
                  value={categoryName}
                  placeholder="Category Name"
                  className="border w-full p-2 rounded-md"
                  onChange={(e) => setCategoryName(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="text"
                  value={categoryDescription}
                  placeholder="Category Description"
                  className="border w-full p-2 rounded-md"
                  onChange={(e) => setCategoryDescription(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-md bg-green-500 text-white p-3 cursor-pointer hover:bg-green"
              >
                Add Category
              </button>
            </form>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-4 w-full lg:w-1/2">
          <h2 className="text-xl font-bold mb-4">Existing Categories</h2>

          {loading && (
            <div className="text-center text-gray-500 animate-pulse">
              Loading categories...
            </div>
          )}

          {error && (
            <div className="text-center text-red-500 font-medium">
              {error}
            </div>
          )}

          {!loading && !error && categories.length === 0 && (
            <p className="text-gray-500 text-center">No categories found.</p>
          )}

          {!loading && !error && categories.length > 0 && (
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat._id} className="border-b p-2">
                  {cat.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;
