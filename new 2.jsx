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
    MdQrCode
} from "react-icons/md";

const formatTZS = (amount) => {
    return new Intl.NumberFormat('en-TZ', {
        style: 'currency',
        currency: 'TZS',
        minimumFractionDigits: 0
    }).format(amount);
};

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
        <div className={`fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-[60] ${styles[type]} text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3`}>
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

    const [formData, setFormData] = useState({
        name: "",
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

    const API_URL = import.meta.env.VITE_API_URL || "https://inventory-pro-api-4jnw.onrender.com";

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
            const response = await axios.get(`${API_URL}/api/product/get`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` }
            });
            setProducts(response.data.products || []);
        } catch {
            showToast("Failed to load products", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/category/get`);
            setCategories(response.data.categories || []);
        } catch {}
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.category || !formData.costPrice || !formData.sellingPrice) {
            showToast("Fill required fields", "error");
            return;
        }

        try {
            const payload = {
                ...formData,
                costPrice: Number(formData.costPrice),
                sellingPrice: Number(formData.sellingPrice),
                quantity: Number(formData.quantity) || 0
            };

            if (editingProduct) {
                await axios.put(`${API_URL}/api/product/update/${editingProduct._id}`, payload);
            } else {
                await axios.post(`${API_URL}/api/product/add`, payload);
            }

            showToast("Saved!");
            closeModal();
            fetchProducts();
        } catch {
            showToast("Error saving", "error");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete product?")) return;
        await axios.delete(`${API_URL}/api/product/delete/${id}`);
        fetchProducts();
    };

    const openModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData(product);
        } else {
            setEditingProduct(null);
            setFormData({
                name: "",
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

    const calculateProfit = (cost, selling) => {
        const profit = selling - cost;
        const margin = selling > 0 ? ((profit / selling) * 100).toFixed(1) : 0;
        return { profit, margin };
    };

    return (
        <div className="p-4">
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}

            <div className="flex justify-between mb-4">
                <h1 className="text-xl font-bold">Products</h1>
                <button onClick={() => openModal()} className="bg-[#00c0c7] text-white px-3 py-2 rounded-lg flex items-center gap-2">
                    <MdAdd /> Add
                </button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                {products.map(p => {
                    const profit = calculateProfit(p.costPrice, p.sellingPrice);
                    return (
                        <div key={p._id} className="bg-white p-4 rounded-xl shadow">
                            <h3 className="font-semibold">{p.name}</h3>
                            <p className="text-xs text-gray-500">SKU: {p.sku}</p>

                            <p className="text-green-600 font-bold">
                                {formatTZS(p.sellingPrice)}
                            </p>

                            <p className="text-xs">
                                Profit: {formatTZS(profit.profit)} ({profit.margin}%)
                            </p>

                            <div className="flex gap-2 mt-2">
                                <button onClick={() => openModal(p)}><MdEdit /></button>
                                <button onClick={() => handleDelete(p._id)}><MdDelete /></button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl w-full max-w-md space-y-3">
                        <input placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        <input placeholder="Cost Price (TZS)" value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: e.target.value})} />
                        <input placeholder="Selling Price (TZS)" value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: e.target.value})} />

                        <div className="flex gap-2">
                            <button type="submit" className="bg-[#00c0c7] text-white px-4 py-2 rounded">Save</button>
                            <button type="button" onClick={closeModal}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Products;