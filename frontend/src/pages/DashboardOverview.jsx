import React from 'react';
import { FaBox, FaShoppingCart, FaTruck, FaUsers, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const DashboardOverview = () => {
  const stats = [
    {
      title: "Total Products",
      value: "1,234",
      change: "+12.5%",
      isPositive: true,
      icon: <FaBox />,
      color: "bg-blue-500",
    },
    {
      title: "Total Orders",
      value: "856",
      change: "+8.2%",
      isPositive: true,
      icon: <FaShoppingCart />,
      color: "bg-green-500",
    },
    {
      title: "Suppliers",
      value: "45",
      change: "-2.4%",
      isPositive: false,
      icon: <FaTruck />,
      color: "bg-purple-500",
    },
    {
      title: "Active Users",
      value: "2,345",
      change: "+15.3%",
      isPositive: true,
      icon: <FaUsers />,
      color: "bg-orange-500",
    },
  ];

  const recentOrders = [
    { id: "#ORD-001", customer: "John Doe", product: "Coca Cola 500ml", status: "Delivered", amount: "TZS 5,000" },
    { id: "#ORD-002", customer: "Jane Smith", product: "Pepsi 1L", status: "Pending", amount: "TZS 8,000" },
    { id: "#ORD-003", customer: "Mike Johnson", product: "Sprite 500ml", status: "Processing", amount: "TZS 6,500" },
    { id: "#ORD-004", customer: "Sarah Williams", product: "Fanta 2L", status: "Delivered", amount: "TZS 12,000" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Processing":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl`}>
                {stat.icon}
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {stat.isPositive ? <FaArrowUp size={12} /> : <FaArrowDown size={12} />}
                {stat.change}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-sm text-gray-500">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-5 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Product</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders.map((order, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-sm font-medium text-gray-900">{order.id}</td>
                  <td className="px-5 py-4 text-sm text-gray-700">{order.customer}</td>
                  <td className="px-5 py-4 text-sm text-gray-700 hidden md:table-cell">{order.product}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-gray-900 hidden sm:table-cell">{order.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
