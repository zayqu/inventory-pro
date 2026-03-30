import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import {
  FaBox,
  FaCog,
  FaHome,
  FaShoppingCart,
  FaSignOutAlt,
  FaTable,
  FaTruck,
  FaUser,
  FaBars,
  FaTimes,
} from 'react-icons/fa';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { name: "Dashboard", path: "/admin", icon: <FaHome />, end: true },
    { name: "Categories", path: "/admin/categories", icon: <FaTable /> },
    { name: "Products", path: "/admin/products", icon: <FaBox /> },
    { name: "Suppliers", path: "/admin/suppliers", icon: <FaTruck /> },
    { name: "Orders", path: "/admin/orders", icon: <FaShoppingCart /> },
    { name: "Users", path: "/admin/users", icon: <FaUser /> },
  ];

  const bottomMenuItems = [
    { name: "Profile", path: "/admin/profile", icon: <FaCog /> },
    { name: "Logout", path: "/login", icon: <FaSignOutAlt />, isLogout: true },
  ];

  const handleLogout = () => {
    localStorage.removeItem("pos-token");
    navigate("/login");
  };

  return (
    <aside
      className={`hidden md:flex flex-col h-screen bg-white border-r border-gray-200 fixed left-0 top-0 transition-all duration-300 z-40 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        {!isCollapsed && (
          <span className="text-xl font-bold text-[#00c0c7] tracking-wide">
            DARAJA
          </span>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors ml-auto"
        >
          {isCollapsed ? <FaBars size={20} /> : <FaTimes size={20} />}
        </button>
      </div>

      {/* Main Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.name}>
              <NavLink
                end={item.end}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group
                  ${
                    isActive
                      ? "bg-[#00c0c7] text-white shadow-md"
                      : "hover:bg-gray-100 text-gray-700"
                  }`
                }
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                {!isCollapsed && (
                  <span className="text-sm font-medium truncate">{item.name}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Menu */}
      <div className="border-t border-gray-200 py-3 px-3">
        <ul className="space-y-1">
          {bottomMenuItems.map((item) => (
            <li key={item.name}>
              {item.isLogout ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 hover:bg-red-50 text-red-600 w-full"
                >
                  <span className="text-lg flex-shrink-0">{item.icon}</span>
                  {!isCollapsed && (
                    <span className="text-sm font-medium truncate">{item.name}</span>
                  )}
                </button>
              ) : (
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200
                    ${
                      isActive
                        ? "bg-gray-100 text-gray-900"
                        : "hover:bg-gray-100 text-gray-700"
                    }`
                  }
                >
                  <span className="text-lg flex-shrink-0">{item.icon}</span>
                  {!isCollapsed && (
                    <span className="text-sm font-medium truncate">{item.name}</span>
                  )}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-3 border-t border-gray-200 text-center text-xs text-gray-500">
          © 2025 Daraja
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
