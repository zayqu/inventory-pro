import React, { useState, useEffect } from "react";
import axios from "axios";

const Categories = () => {
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categories, setCategories] = useState([]);

  // Fetch categories
  useEffect(() => {
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

    fetchCategories();
  }, []);

  // Add category
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

        // Refresh list after adding
        setCategories((prev) => [
          ...prev,
          response.data.category || {
            categoryName,
            categoryDescription,
          },
        ]);
      } else {
        console.error("Error adding category", response.data);
        alert("Error adding category. Please try again.");
      }
    } catch (error) {
      console.error("Request failed", error);
      alert("Server error. Check backend.");
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-8">Category Management</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Form */}
        <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4 text-center">
            Add Category
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Category Name"
              className="border w-full p-2 rounded-md"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Category Description"
              className="border w-full p-2 rounded-md"
              value={categoryDescription}
              onChange={(e) => setCategoryDescription(e.target.value)}
              required
            />

            <button
              type="submit"
              className="w-full rounded-md bg-green-500 text-white p-3 hover:bg-green-600"
            >
              Add Category
            </button>
          </form>
        </div>

        {/* Category List */}
        <div className="bg-white shadow-md rounded-lg p-6 w-full">
          <h2 className="text-xl font-bold mb-4">Categories</h2>

          {categories.length === 0 ? (
            <p className="text-gray-500">No categories found</p>
          ) : (
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border text-left">Name</th>
                  <th className="p-2 border text-left">Description</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, index) => (
                  <tr key={index}>
                    <td className="p-2 border">
                      {cat.categoryName || cat.name}
                    </td>
                    <td className="p-2 border">
                      {cat.categoryDescription || cat.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;