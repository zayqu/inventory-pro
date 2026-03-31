import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
    MdSearch, 
    MdAdd, 
    MdEdit, 
    MdDelete, 
    MdClose, 
    MdInventory,
    MdWarning,
    MdFilterList,
    MdQrCode,
    MdAttachMoney
} from "react-icons/md";

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const styles = {
        success: "bg-emerald-500",
        error: "bg-rose-500",
        warning: "bg-amber-500"
    };

    return (
        <div className={`fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-[60] animate-in slide-in-from-top-2 ${styles[type]} text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3`}>
            <span className="text-sm font-medium flex-1">{message}</span>
            <button onClick={onClose}><MdClose className="w-4 h-4" /></button>
        </div>
    );
};

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [showLowStock, setShowLowStock] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [toast, setToast] = useState(null);
    const [lowStockCount, setLowStockCount] = useState(0);

    const [formData, setFormData] = useState({
        name: "",
        sku: "",
        barcode: "",
        category: "",
        description: "",
        costPrice: "",
        sellingPrice: "",
        quantity: "",
        lowStockAlert: "10",
        supplier: "",
        unit: "pcs"
    });

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [searchQuery, filterCategory, showLowStock]);

    const showToast = (message, type = "success") => {
        setToast({ message, type });
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            if (filterCategory) params.append('category', filterCategory);
            if (showLowStock) params.append('lowStock', 'true');

            const response = await axios.get(`${API_URL}/api/product/get?${params}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` }
            });

            if (response.data.success) {
                setProducts(response.data.products);
                setLowStockCount(response.data.lowStockCount);
            }
        } catch (error) {
            showToast("Failed to load products", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/category/get`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` }
            });
            if (response.data.success) {
                setCategories(response.data.categories);
            }
        } catch (error) {
            console.error("Error fetching categories");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.sku || !formData.category || !formData.costPrice || !formData.sellingPrice) {
            showToast("Please fill all required fields", "error");
            return;
        }

        try {
            setLoading(true);
            const payload = {
                ...formData,
                costPrice: Number(formData.costPrice),
                sellingPrice: Number(formData.sellingPrice),
                quantity: Number(formData.quantity) || 0,
                lowStockAlert: Number(formData.lowStockAlert) || 10
            };

            let response;
            if (editingProduct) {
                response = await axios.put(
                    `${API_URL}/api/product/update/${editingProduct._id}`,
                    payload,
                    { headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` } }
                );
            } else {
                response = await axios.post(
                    `${API_URL}/api/product/add`,
                    payload,
                    { headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` } }
                );
            }

            if (response.data.success) {
                showToast(editingProduct ? "Product updated!" : "Product created!");
                closeModal();
                fetchProducts();
            }
        } catch (error) {
            showToast(error.response?.data?.message || "Operation failed", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this product?")) return;
        
        try {
            const response = await axios.delete(
                `${API_URL}/api/product/delete/${id}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` } }
            );
            if (response.data.success) {
                showToast("Product deleted!");
                fetchProducts();
            }
        } catch (error) {
            showToast("Failed to delete", "error");
        }
    };

    const openModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name || "",
                sku: product.sku || "",
                barcode: product.barcode || "",
                category: product.category?._id || product.category || "",
                description: product.description || "",
                costPrice: product.costPrice || "",
                sellingPrice: product.sellingPrice || "",
                quantity: product.quantity || "",
                lowStockAlert: product.lowStockAlert || "10",
                supplier: product.supplier || "",
                unit: product.unit || "pcs"
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: "",
                sku: "",
                barcode: "",
                category: "",
                description: "",
                costPrice: "",
                sellingPrice: "",
                quantity: "",
                lowStockAlert: "10",
                supplier: "",
                unit: "pcs"
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const getStockStatus = (qty, alert) => {
        if (qty <= 0) return { text: "Out of Stock", color: "bg-red-100 text-red-700" };
        if (qty <= alert) return { text: "Low Stock", color: "bg-amber-100 text-amber-700" };
        return { text: "In Stock", color: "bg-emerald-100 text-emerald-700" };
    };

    const calculateProfit = (cost, selling) => {
        const profit = selling - cost;
        const margin = ((profit / selling) * 100).toFixed(1);
        return { profit, margin };
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            {/* Header */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100">
                <div className="px-4 py-4 md:px-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Products</h1>
                                <p className="text-xs text-gray-500">{products.length} items • {lowStockCount} low stock</p>
                            </div>
                            {lowStockCount > 0 && (
                                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                    <MdWarning size={12} />
                                    {lowStockCount}
                                </span>
                            )}
                        </div>
                        <button onClick={() => openModal()} className="flex items-center gap-1 bg-[#00c0c7] text-white px-3 py-2 rounded-xl hover:bg-[#00a8af] active:scale-95 transition-all shadow-lg">
                            <MdAdd size={18} />
                            <span className="text-sm font-medium">Add Product</span>
                        </button>
                    </div>

                    {/* Search & Filters */}
                    <div className="space-y-3">
                        <div className="relative">
                            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, SKU, or barcode..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-100/50 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-[#00c0c7]/20 outline-none"
                            />
                        </div>
                        
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.categoryName || cat.name}</option>
                                ))}
                            </select>
                            
                            <button
                                onClick={() => setShowLowStock(!showLowStock)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1 whitespace-nowrap ${
                                    showLowStock ? 'bg-red-100 text-red-700' : 'bg-white border border-gray-200 text-gray-600'
                                }`}
                            >
                                <MdWarning size={16} />
                                Low Stock
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Grid/List */}
            <div className="p-4 md:p-6 max-w-7xl mx-auto">
                {products.length === 0 ? (
                    <div className="text-center py-16">
                        <MdInventory className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900">No products found</h3>
                        <p className="text-gray-500 text-sm">Add your first product to get started</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {products.map(product => {
                            const stockStatus = getStockStatus(product.quantity, product.lowStockAlert);
                            const profit = calculateProfit(product.costPrice, product.sellingPrice);
                            
                            return (
                                <div key={product._id} className="bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className={`px-2 py-1 rounded-lg text-xs font-medium ${stockStatus.color}`}>
                                            {stockStatus.text}
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => openModal(product)} className="p-1.5 text-gray-400 hover:text-[#00c0c7]">
                                                <MdEdit size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(product._id)} className="p-1.5 text-gray-400 hover:text-red-500">
                                                <MdDelete size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <h3 className="font-semibold text-gray-900 mb-1 truncate">{product.name}</h3>
                                    <p className="text-xs text-gray-500 mb-3">SKU: {product.sku}</p>
                                    
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div className="bg-gray-50 p-2 rounded-lg">
                                            <p className="text-xs text-gray-500">Stock</p>
                                            <p className="text-sm font-semibold text-gray-900">{product.quantity} {product.unit}</p>
                                        </div>
                                        <div className="bg-gray-50 p-2 rounded-lg">
                                            <p className="text-xs text-gray-500">Price</p>
                                            <p className="text-sm font-semibold text-emerald-600">${product.sellingPrice}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>Profit: ${profit.profit} ({profit.margin}%)</span>
                                        <span className="bg-gray-100 px-2 py-1 rounded">{product.category?.categoryName || product.category?.name}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
                            <h2 className="text-lg font-bold">{editingProduct ? "Edit Product" : "New Product"}</h2>
                            <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full">
                                <MdClose />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium mb-1">Product Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#00c0c7]/20"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">SKU *</label>
                                    <input
                                        type="text"
                                        value={formData.sku}
                                        onChange={(e) => setFormData({...formData, sku: e.target.value.toUpperCase()})}
                                        className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#00c0c7]/20"
                                        required
                                        disabled={editingProduct}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">Barcode</label>
                                    <div className="relative">
                                        <MdQrCode className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={formData.barcode}
                                            onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                                            className="w-full pl-10 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#00c0c7]/20"
                                        />
                                    </div>
                                </div>
                                
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium mb-1">Category *</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#00c0c7]/20"
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.categoryName || cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">Cost Price *</label>
                                    <div className="relative">
                                        <MdAttachMoney className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.costPrice}
                                            onChange={(e) => setFormData({...formData, costPrice: e.target.value})}
                                            className="w-full pl-10 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#00c0c7]/20"
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">Selling Price *</label>
                                    <div className="relative">
                                        <MdAttachMoney className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.sellingPrice}
                                            onChange={(e) => setFormData({...formData, sellingPrice: e.target.value})}
                                            className="w-full pl-10 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#00c0c7]/20"
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">Quantity</label>
                                    <input
                                        type="number"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#00c0c7]/20"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">Low Stock Alert</label>
                                    <input
                                        type="number"
                                        value={formData.lowStockAlert}
                                        onChange={(e) => setFormData({...formData, lowStockAlert: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#00c0c7]/20"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">Unit</label>
                                    <select
                                        value={formData.unit}
                                        onChange={(e) => setFormData({...formData, unit: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#00c0c7]/20"
                                    >
                                        {['pcs', 'kg', 'ltr', 'box', 'carton', 'dozen', 'meter', 'gram'].map(u => (
                                            <option key={u} value={u}>{u}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">Supplier</label>
                                    <input
                                        type="text"
                                        value={formData.supplier}
                                        onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#00c0c7]/20"
                                    />
                                </div>
                                
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <textarea
                                        rows="2"
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#00c0c7]/20 resize-none"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex gap-3 pt-4 sticky bottom-0 bg-white">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 bg-[#00c0c7] text-white rounded-xl font-medium disabled:opacity-50"
                                >
                                    {loading ? "Saving..." : (editingProduct ? "Update" : "Create")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;