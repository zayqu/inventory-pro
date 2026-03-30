import React from 'react';
import { Link, useNavigate } from 'react-router';
import { FaTruck, FaUser, FaCog, FaSignOutAlt, FaChevronRight } from 'react-icons/fa';

const More = () => {
  const navigate = useNavigate();

  const menuItems = [
    { name: "Suppliers", path: "/admin/suppliers", icon: <FaTruck />, color: "text-purple-600" },
    { name: "Users", path: "/admin/users", icon: <FaUser />, color: "text-blue-600" },
    { name: "Profile", path: "/admin/profile", icon: <FaCog />, color: "text-gray-600" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("pos-token");
    navigate("/login");
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">More</h1>
        <p className="text-sm text-gray-500 mt-1">Additional settings and options</p>
      </div>

      {/* Menu Items */}
      <div className="space-y-3">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className="flex items-center justify-between bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-all border border-gray-100"
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 ${item.color} bg-gray-100 rounded-lg flex items-center justify-center text-lg`}>
                {item.icon}
              </div>
              <span className="font-medium text-gray-900">{item.name}</span>
            </div>
            <FaChevronRight className="text-gray-400" size={16} />
          </Link>
        ))}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-between bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-all border border-gray-100 hover:border-red-200"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 text-red-600 bg-red-50 rounded-lg flex items-center justify-center text-lg">
              <FaSignOutAlt />
            </div>
            <span className="font-medium text-red-600">Logout</span>
          </div>
          <FaChevronRight className="text-red-400" size={16} />
        </button>
      </div>

      {/* App Info */}
      <div className="mt-8 text-center text-xs text-gray-500">
        <p>Daraja Inventory Management v1.0</p>
        <p className="mt-1">© 2025 Daraja. All rights reserved.</p>
      </div>
    </div>
  );
};

export default More;
