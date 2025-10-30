import React from 'react';
import { Link, NavLink } from 'react-router';
import {
  FaBox,
  FaCog,
  FaHome,
  FaShoppingCart,
  FaSignOutAlt,
  FaTable,
  FaTruck,
  FaUser,
} from 'react-icons/fa';

const Sidebar = () => {
  const menuItems = [
    { name: "Dashboard", path: "/admin-dashboard", icon: <FaHome />, isParent: true},
    { name: "Categories", path: "/admin-dashboard/categories", icon: <FaTable />, isParent: false},
    { name: "Products", path: "/admin-dashboard/products", icon: <FaBox />, isParent: false },
    { name: "Suppliers", path: "/admin-dashboard/suppliers", icon: <FaTruck />, isParent: false },
    { name: "Orders", path: "/admin-dashboard/orders", icon: <FaShoppingCart />, isParent: false },
    { name: "Users", path: "/admin-dashboard/users", icon: <FaUser />, isParent: false },
    { name: "Profile", path: "/admin-dashboard/profile", icon: <FaCog />, isParent: false },
    { name: "Logout", path: "/admin-dashboard/logout", icon: <FaSignOutAlt />, isParent: false },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#1e2a38] text-white w-20 md:w-64 fixed shadow-xl transition-all duration-300">
      {/* Logo / Header */}
      <div className="h-16 flex items-center justify-center border-b border-gray-700">
        <span className="hidden md:block text-xl font-bold text-[#00c0c7] tracking-wide">
          DARAJA
        </span>
        <span className="md:hidden text-lg font-bold text-[#00c0c7]">D</span>
      </div>

      {/* Menu Items */}
      <ul className="flex-1 overflow-y-auto mt-4 space-y-1 px-2">
        {menuItems.map((item) => (
          <li key={item.name}>
            <NavLink
              end={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-2 rounded-md transition-all duration-200 
                ${
                  isActive
                    ? "bg-[#00c0c7] text-[#1e2a38] font-semibold"
                    : "hover:bg-[#00c0c7]/20 text-gray-300 hover:text-white"
                }`
              }
            >
              <span className="text-xl">{item.icon}</span>
              <span className="hidden md:inline text-sm">{item.name}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Footer or Branding */}
      <div className="p-3 border-t border-gray-700 text-center text-xs text-gray-500">
        © 2025 Daraja
      </div>
    </div>
  );
};

export default Sidebar;
