import React from 'react';
import { NavLink } from 'react-router';
import {
  FaHome,
  FaTable,
  FaBox,
  FaShoppingCart,
  FaEllipsisH,
} from 'react-icons/fa';

const BottomNav = () => {
  const menuItems = [
    { name: "Home", path: "/admin", icon: <FaHome />, end: true },
    { name: "Categories", path: "/admin/categories", icon: <FaTable /> },
    { name: "Products", path: "/admin/products", icon: <FaBox /> },
    { name: "Orders", path: "/admin/orders", icon: <FaShoppingCart /> },
    { name: "More", path: "/admin/more", icon: <FaEllipsisH /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
      <div className="flex justify-around items-center h-16 px-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            end={item.end}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 
              ${
                isActive
                  ? "text-[#00c0c7]"
                  : "text-gray-500"
              }`
            }
          >
            <span className="text-xl mb-1">{item.icon}</span>
            <span className="text-xs font-medium">{item.name}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
