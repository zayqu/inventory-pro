import React, { useState, useEffect, useRef } from "react";
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
    MdCheckCircle,
    MdError,
    MdInfo,
    MdAttachMoney,
    MdFileDownload,
    MdFileUpload,
    MdMoreVert,
    MdContentCopy,
    MdVisibility,
    MdTrendingUp,
    MdTrendingDown,
    MdImage,
    MdRefresh,
    MdSort,
} from "react-icons/md";

const formatTZS = (amount) => {
    return new Intl.NumberFormat('sw-TZ', {
        style: 'currency',
        currency: 'TZS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

// Generate SKU automatically
const generateSKU = (categoryName, productName) => {
    const catPrefix = categoryName?.substring(0, 3).toUpperCase() || 'PRD';
    const timestamp = Date.now().toString().slice(-6);
    const nameCode = productName?.substring(0, 2).toUpperCase() || 'XX';
    return `${catPrefix}-${nameCode}${timestamp}`;
};

// Generate Barcode automatically (EAN-13 format simulation)
const generateBarcode = () => {
    const prefix = '800'; // Country code for Tanzania
    const random = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
    return prefix + random;
};

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const styles = {
        success: "bg-emerald-500",
        error: "bg-rose-500",
        warning: "bg-amber-500",
        info: "bg-blue-500"
    };

    const icons = {
        success: <MdCheckCircle className="w-5 h-5" />,
        error: <MdError className="w-5 h-5" />,
        warning: <MdWarning className="w-5 h-5" />,
        info: <MdInfo className="w-5 h-5" />
    };

    return (
        <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-[60] animate-in slide-in-from-top-2 fade-in duration-300">
            <div className={`${styles[type]} text-white px-4 py-3 rounded-xl shadow-xl shadow-black/10 flex items-center gap-3`}>
                {icons[type]}
                <span className="text-sm font-medium flex-1">{message}</span>
                <button onClick={onClose} className="opacity-80 hover:opacity-100">
                    <MdClose className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

// Quick Stats Component
const QuickStats = ({ products }) => {
    const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.costPrice), 0);
    const totalProfit = products.reduce((sum, p) => sum + ((p.sellingPrice - p.costPrice) * p.quantity), 0);
    const lowStock = products.filter(p => p.quantity <= (p.lowStockAlert || 10)).length;
    const outOfStock = products.filter(p => p.quantity === 0).length;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-white p-3 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Total Items</p>
                <p className="text-xl font-bold text-gray-900">{products.length}</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Inventory Value</p>
                <p className="text-xl font-bold text-emerald-600">{formatTZS(totalValue)}</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Low Stock</p>
                <p className="text-xl font-bold text-amber-600">{lowStock}</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Out of Stock</p>
                <p className="text-xl font-bold text-red-600">{outOfStock}</p>
            </div>
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
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [showQuickView, setShowQuickView] = useState(null);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [importErrors, setImportErrors] = useState([]);
    const fileInputRef = useRef(null);

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

    const API_URL = import.meta.env.VITE_API_URL || "https://inventory-pro-api-4jnw.onrender.com";

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    // Filter and sort products locally
    useEffect(() => {
        let filtered = [...products];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(p => {
                const name = (p.name || "").toLowerCase();
                const sku = (p.sku || "").toLowerCase();
                const barcode = (p.barcode || "").toLowerCase();
                const query = searchQuery.toLowerCase();
                return name.includes(query) || sku.includes(query) || barcode.includes(query);
            });
        }

        // Category filter
        if (filterCategory) {
            filtered = filtered.filter(p => {
                const catId = p.category?._id || p.category;
                return catId === filterCategory;
            });
        }

        // Low stock filter
        if (showLowStock) {
            filtered = filtered.filter(p => p.quantity <= (p.lowStockAlert || 10));
        }

        // Sort
        filtered.sort((a, b) => {
            let aVal, bVal;
            
            switch(sortBy) {
                case 'name':
                    aVal = (a.name || '').toLowerCase();
                    bVal = (b.name || '').toLowerCase();
                    break;
                case 'quantity':
                    aVal = a.quantity || 0;
                    bVal = b.quantity || 0;
                    break;
                case 'price':
                    aVal = a.sellingPrice || 0;
                    bVal = b.sellingPrice || 0;
                    break;
                case 'profit':
                    aVal = (a.sellingPrice - a.costPrice) || 0;
                    bVal = (b.sellingPrice - b.costPrice) || 0;
                    break;
                default:
                    aVal = a.name;
                    bVal = b.name;
            }

            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        setFilteredProducts(filtered);
    }, [searchQuery, filterCategory, showLowStock, products, sortBy, sortOrder]);

    const showToast = (message, type = "success") => {
        setToast({ message, type });
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/product/get`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` }
            });

            if (response.data.success) {
                setProducts(response.data.products || []);
                const lowStock = (response.data.products || []).filter(p => 
                    p.quantity <= (p.lowStockAlert || 10)
                ).length;
                setLowStockCount(lowStock);
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
                setCategories(response.data.categories || []);
            }
        } catch (error) {
            console.error("Error fetching categories");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.category || !formData.costPrice || !formData.sellingPrice) {
            showToast("Please fill all required fields", "error");
            return;
        }

        try {
            setLoading(true);
            
            let sku = formData.sku;
            if (!editingProduct && !sku) {
                const category = categories.find(c => c._id === formData.category);
                sku = generateSKU(category?.categoryName || category?.name, formData.name);
            }

            let barcode = formData.barcode;
            if (!editingProduct && !barcode) {
                barcode = generateBarcode();
            }

            const payload = {
                ...formData,
                sku,
                barcode,
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
                showToast(editingProduct ? "Product updated successfully!" : "Product created successfully!");
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
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        
        try {
            const response = await axios.delete(
                `${API_URL}/api/product/delete/${id}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` } }
            );
            if (response.data.success) {
                showToast("Product deleted successfully!");
                fetchProducts();
            }
        } catch (error) {
            showToast("Failed to delete product", "error");
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Delete ${selectedItems.length} products?`)) return;
        
        try {
            await Promise.all(selectedItems.map(id => 
                axios.delete(`${API_URL}/api/product/delete/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` },
                })
            ));
            setSelectedItems([]);
            setIsSelectionMode(false);
            fetchProducts();
            showToast(`${selectedItems.length} products deleted!`, "success");
        } catch (error) {
            showToast("Failed to delete products", "error");
        }
    };

    const toggleSelection = (id) => {
        setSelectedItems(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const duplicateProduct = (product) => {
        const category = categories.find(c => c._id === product.category?._id || c._id === product.category);
        const newSku = generateSKU(category?.categoryName || category?.name, product.name);
        const newBarcode = generateBarcode();
        
        setFormData({
            name: `${product.name} (Copy)`,
            sku: newSku,
            barcode: newBarcode,
            category: product.category?._id || product.category || "",
            description: product.description || "",
            costPrice: product.costPrice || "",
            sellingPrice: product.sellingPrice || "",
            quantity: "0",
            lowStockAlert: product.lowStockAlert || "10",
            supplier: product.supplier || "",
            unit: product.unit || "pcs"
        });
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    // Export to Excel
    const handleExport = () => {
        const headers = ['Name', 'SKU', 'Barcode', 'Category', 'Description', 'Cost Price', 'Selling Price', 'Quantity', 'Unit', 'Low Stock Alert', 'Supplier'];
        
        const rows = filteredProducts.map(p => [
            p.name || '',
            p.sku || '',
            p.barcode || '',
            p.category?.categoryName || p.category?.name || '',
            p.description || '',
            p.costPrice || 0,
            p.sellingPrice || 0,
            p.quantity || 0,
            p.unit || 'pcs',
            p.lowStockAlert || 10,
            p.supplier || ''
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `products_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        showToast("Products exported successfully!");
    };

    // Download Import Template
    const handleDownloadTemplate = () => {
        const headers = ['Name*', 'Category*', 'Description', 'Cost Price*', 'Selling Price*', 'Quantity', 'Unit', 'Low Stock Alert', 'Supplier'];
        const exampleRow = ['Coca Cola 500ml', 'Soft Drinks', 'Refreshing beverage', '1000', '1500', '100', 'pcs', '10', 'ABC Distributors'];
        
        const csvContent = [
            headers.join(','),
            exampleRow.map(cell => `"${cell}"`).join(',')
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'product_import_template.csv';
        link.click();
        
        showToast("Template downloaded!", "info");
    };

    // Handle Import File Selection
    const handleImportFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
            if (!validTypes.includes(file.type) && !file.name.endsWith('.csv')) {
                showToast("Please upload a CSV or Excel file", "error");
                return;
            }
            setImportFile(file);
        }
    };

    // Process Import
    const handleImport = async () => {
        if (!importFile) {
            showToast("Please select a file to import", "error");
            return;
        }

        setLoading(true);
        setImportErrors([]);

        try {
            const text = await importFile.text();
            const lines = text.split('\n').filter(line => line.trim());
            
            if (lines.length < 2) {
                showToast("File is empty or invalid", "error");
                setLoading(false);
                return;
            }

            const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
            const errors = [];
            const successfulImports = [];

            for (let i = 1; i < lines.length; i++) {
                try {
                    const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
                    const row = {};
                    
                    headers.forEach((header, index) => {
                        row[header.replace('*', '')] = values[index] || '';
                    });

                    // Validate required fields
                    if (!row.Name || !row.Category || !row['Cost Price'] || !row['Selling Price']) {
                        errors.push(`Row ${i + 1}: Missing required fields`);
                        continue;
                    }

                    // Find category
                    const category = categories.find(c => 
                        (c.categoryName || c.name || '').toLowerCase() === row.Category.toLowerCase()
                    );

                    if (!category) {
                        errors.push(`Row ${i + 1}: Category "${row.Category}" not found`);
                        continue;
                    }

                    // Generate SKU and Barcode
                    const sku = generateSKU(category.categoryName || category.name, row.Name);
                    const barcode = generateBarcode();

                    const payload = {
                        name: row.Name,
                        sku,
                        barcode,
                        category: category._id,
                        description: row.Description || '',
                        costPrice: Number(row['Cost Price']) || 0,
                        sellingPrice: Number(row['Selling Price']) || 0,
                        quantity: Number(row.Quantity) || 0,
                        unit: row.Unit || 'pcs',
                        lowStockAlert: Number(row['Low Stock Alert']) || 10,
                        supplier: row.Supplier || ''
                    };

                    const response = await axios.post(
                        `${API_URL}/api/product/add`,
                        payload,
                        { headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` } }
                    );

                    if (response.data.success) {
                        successfulImports.push(row.Name);
                    }
                } catch (error) {
                    errors.push(`Row ${i + 1}: ${error.response?.data?.message || 'Failed to import'}`);
                }
            }

            setImportErrors(errors);
            
            if (successfulImports.length > 0) {
                showToast(`Successfully imported ${successfulImports.length} products!`, "success");
                fetchProducts();
            }
            
            if (errors.length === 0) {
                setShowImportModal(false);
                setImportFile(null);
            }
        } catch (error) {
            showToast("Failed to process import file", "error");
        } finally {
            setLoading(false);
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

    const getInitials = (name) => {
        return name ? name.substring(0, 2).toUpperCase() : "PR";
    };

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
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            {/* Header */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100">
                <div className="px-4 py-4 md:px-6 md:py-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Products</h1>
                            <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                                {filteredProducts.length} items
                                {lowStockCount > 0 && ` • ${lowStockCount} low stock`}
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {/* Actions Menu */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowActionsMenu(!showActionsMenu)}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <MdMoreVert size={20} />
                                </button>
                                
                                {showActionsMenu && (
                                    <>
                                        <div 
                                            className="fixed inset-0 z-40" 
                                            onClick={() => setShowActionsMenu(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                                            <button
                                                onClick={() => {
                                                    handleDownloadTemplate();
                                                    setShowActionsMenu(false);
                                                }}
                                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                                            >
                                                <MdFileDownload size={18} />
                                                Download Template
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowImportModal(true);
                                                    setShowActionsMenu(false);
                                                }}
                                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                                            >
                                                <MdFileUpload size={18} />
                                                Import Products
                                            </button>
                                            <button
                                                onClick={() => {
                                                    handleExport();
                                                    setShowActionsMenu(false);
                                                }}
                                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                                            >
                                                <MdFileDownload size={18} />
                                                Export to CSV
                                            </button>
                                            <div className="border-t border-gray-100 my-2" />
                                            <button
                                                onClick={() => {
                                                    fetchProducts();
                                                    setShowActionsMenu(false);
                                                }}
                                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                                            >
                                                <MdRefresh size={18} />
                                                Refresh Data
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                            
                            <button 
                                onClick={() => openModal()} 
                                className="flex items-center gap-1.5 bg-[#00c0c7] text-white px-3 py-2 md:px-4 md:py-2.5 rounded-xl hover:bg-[#00a8af] active:scale-95 transition-all shadow-lg shadow-[#00c0c7]/25"
                            >
                                <MdAdd size={18} />
                                <span className="text-sm font-medium hidden sm:inline">Add New</span>
                                <span className="text-sm font-medium sm:hidden">Add</span>
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <QuickStats products={products} />

                    {/* Search Bar */}
                    <div className="relative mb-3">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MdSearch className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name, SKU, or barcode..."
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
                    
                    {/* Filters & Sort */}
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#00c0c7]/20 focus:outline-none"
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat._id}>{cat.categoryName || cat.name}</option>
                            ))}
                        </select>
                        
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#00c0c7]/20 focus:outline-none"
                        >
                            <option value="name">Sort: Name</option>
                            <option value="quantity">Sort: Stock</option>
                            <option value="price">Sort: Price</option>
                            <option value="profit">Sort: Profit</option>
                        </select>
                        
                        <button
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium flex items-center gap-1"
                        >
                            {sortOrder === 'asc' ? <MdTrendingUp size={16} /> : <MdTrendingDown size={16} />}
                        </button>
                        
                        <button
                            onClick={() => setShowLowStock(!showLowStock)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 whitespace-nowrap transition-all ${
                                showLowStock ? 'bg-red-100 text-red-700' : 'bg-white border border-gray-200 text-gray-600'
                            }`}
                        >
                            <MdWarning size={16} />
                            Low Stock
                        </button>
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

            {/* Products List */}
            <div className="px-4 py-4 md:px-6 md:py-6 max-w-7xl mx-auto">
                {filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <MdInventory className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {searchQuery || filterCategory || showLowStock ? "No products found" : "No products yet"}
                        </h3>
                        <p className="text-sm text-gray-500 max-w-xs mb-6">
                            {searchQuery || filterCategory || showLowStock 
                                ? "Try adjusting your filters" 
                                : "Get started by creating your first product"}
                        </p>
                        {!searchQuery && !filterCategory && !showLowStock && (
                            <button
                                onClick={() => openModal()}
                                className="inline-flex items-center gap-2 bg-[#00c0c7] text-white px-5 py-2.5 rounded-xl hover:bg-[#00a8af] active:scale-95 transition-all shadow-lg shadow-[#00c0c7]/25 font-medium"
                            >
                                <MdAdd size={18} />
                                <span>Create Product</span>
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Desktop Header */}
                        <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-gray-50/50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <div className="col-span-3">Product</div>
                            <div className="col-span-2">Category</div>
                            <div className="col-span-2">Stock</div>
                            <div className="col-span-2">Price</div>
                            <div className="col-span-2">Profit</div>
                            <div className="col-span-1 text-right">Actions</div>
                        </div>

                        {/* List Items */}
                        <div className="divide-y divide-gray-50">
                            {filteredProducts.map((product) => {
                                const isSelected = selectedItems.includes(product._id);
                                const stockStatus = getStockStatus(product.quantity, product.lowStockAlert);
                                const profit = calculateProfit(product.costPrice, product.sellingPrice);
                                const colorClass = getColorClass(product.name);
                                
                                return (
                                    <div
                                        key={product._id}
                                        onClick={() => isSelectionMode && toggleSelection(product._id)}
                                        onContextMenu={(e) => {
                                            e.preventDefault();
                                            setIsSelectionMode(true);
                                            toggleSelection(product._id);
                                        }}
                                        className={`
                                            group relative flex items-center gap-3 md:gap-4 p-4 md:px-6 md:py-4 
                                            hover:bg-gray-50/80 active:bg-gray-100 transition-all duration-200
                                            ${isSelected ? 'bg-[#00c0c7]/5 border-l-4 border-l-[#00c0c7]' : 'border-l-4 border-l-transparent'}
                                        `}
                                    >
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

                                        <div className={`
                                            flex-shrink-0 w-12 h-12 md:w-10 md:h-10 rounded-xl ${colorClass} 
                                            flex items-center justify-center text-white font-bold text-sm md:text-xs shadow-sm
                                        `}>
                                            {getInitials(product.name)}
                                        </div>

                                        <div className="flex-1 min-w-0 grid md:grid-cols-12 gap-1 md:gap-4 items-center">
                                            <div className="md:col-span-3 min-w-0">
                                                <h3 className="text-sm md:text-base font-semibold text-gray-900 truncate group-hover:text-[#00c0c7] transition-colors">
                                                    {product.name}
                                                </h3>
                                                <p className="text-xs text-gray-500 truncate mt-0.5">SKU: {product.sku}</p>
                                            </div>
                                            
                                            <div className="hidden md:block md:col-span-2">
                                                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                                                    {product.category?.categoryName || product.category?.name || 'N/A'}
                                                </span>
                                            </div>

                                            <div className="hidden md:block md:col-span-2">
                                                <div className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${stockStatus.color}`}>
                                                    {stockStatus.text}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">{product.quantity} {product.unit}</p>
                                            </div>

                                            <div className="hidden md:block md:col-span-2">
                                                <p className="text-sm font-semibold text-emerald-600">{formatTZS(product.sellingPrice)}</p>
                                                <p className="text-xs text-gray-500">Cost: {formatTZS(product.costPrice)}</p>
                                            </div>

                                            <div className="hidden md:block md:col-span-2">
                                                <p className="text-sm font-semibold text-gray-900">{formatTZS(profit.profit)}</p>
                                                <p className="text-xs text-gray-500">{profit.margin}% margin</p>
                                            </div>

                                            <div className="md:hidden grid grid-cols-3 gap-2 col-span-full mt-2">
                                                <div>
                                                    <p className="text-xs text-gray-500">Stock</p>
                                                    <p className="text-sm font-semibold text-gray-900">{product.quantity}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Price</p>
                                                    <p className="text-sm font-semibold text-emerald-600">{formatTZS(product.sellingPrice)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Profit</p>
                                                    <p className="text-sm font-semibold text-gray-900">{formatTZS(profit.profit)}</p>
                                                </div>
                                            </div>

                                            <div className="hidden md:flex md:col-span-1 justify-end gap-1">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setShowQuickView(product); }}
                                                    className="p-2 text-gray-400 hover:text-[#00c0c7] hover:bg-[#00c0c7]/10 rounded-lg transition-all"
                                                    title="Quick View"
                                                >
                                                    <MdVisibility size={18} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); duplicateProduct(product); }}
                                                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Duplicate"
                                                >
                                                    <MdContentCopy size={18} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); openModal(product); }}
                                                    className="p-2 text-gray-400 hover:text-[#00c0c7] hover:bg-[#00c0c7]/10 rounded-lg transition-all"
                                                    title="Edit"
                                                >
                                                    <MdEdit size={18} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(product._id); }}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete"
                                                >
                                                    <MdDelete size={18} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="md:hidden flex items-center gap-1 text-gray-300">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setShowQuickView(product); }}
                                                className="p-2 hover:text-[#00c0c7] active:scale-90 transition-all"
                                            >
                                                <MdVisibility size={20} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); openModal(product); }}
                                                className="p-2 hover:text-[#00c0c7] active:scale-90 transition-all"
                                            >
                                                <MdEdit size={20} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(product._id); }}
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
                onClick={() => openModal()}
                className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-[#00c0c7] text-white rounded-full shadow-xl shadow-[#00c0c7]/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40"
            >
                <MdAdd size={24} />
            </button>

            {/* Quick View Modal */}
            {showQuickView && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100">
                            <h2 className="text-lg md:text-xl font-bold text-gray-900">Product Details</h2>
                            <button
                                onClick={() => setShowQuickView(null)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <MdClose className="text-gray-400 w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-4 md:p-6 space-y-4">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Product Name</p>
                                <p className="text-base font-semibold text-gray-900">{showQuickView.name}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">SKU</p>
                                    <p className="text-sm text-gray-900">{showQuickView.sku}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Barcode</p>
                                    <p className="text-sm text-gray-900">{showQuickView.barcode}</p>
                                </div>
                            </div>
                            
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Category</p>
                                <p className="text-sm text-gray-900">{showQuickView.category?.categoryName || showQuickView.category?.name}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Cost Price</p>
                                    <p className="text-base font-semibold text-gray-900">{formatTZS(showQuickView.costPrice)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Selling Price</p>
                                    <p className="text-base font-semibold text-emerald-600">{formatTZS(showQuickView.sellingPrice)}</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Stock</p>
                                    <p className="text-base font-semibold text-gray-900">{showQuickView.quantity} {showQuickView.unit}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Profit</p>
                                    <p className="text-base font-semibold text-emerald-600">
                                        {formatTZS(showQuickView.sellingPrice - showQuickView.costPrice)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Margin</p>
                                    <p className="text-base font-semibold text-gray-900">
                                        {calculateProfit(showQuickView.costPrice, showQuickView.sellingPrice).margin}%
                                    </p>
                                </div>
                            </div>
                            
                            {showQuickView.description && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Description</p>
                                    <p className="text-sm text-gray-900">{showQuickView.description}</p>
                                </div>
                            )}
                            
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        setShowQuickView(null);
                                        openModal(showQuickView);
                                    }}
                                    className="flex-1 px-4 py-3 bg-[#00c0c7] text-white rounded-xl hover:bg-[#00a8af] transition-colors font-medium text-sm"
                                >
                                    Edit Product
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Import Modal */}
            {showImportModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
                            <h2 className="text-lg md:text-xl font-bold text-gray-900">Import Products</h2>
                            <button
                                onClick={() => {
                                    setShowImportModal(false);
                                    setImportFile(null);
                                    setImportErrors([]);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <MdClose className="text-gray-400 w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-4 md:p-6 space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <p className="text-sm text-blue-900 mb-2 font-medium">📋 Import Instructions:</p>
                                <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                                    <li>Download the template first</li>
                                    <li>Fill in product details (Name, Category, Cost Price, Selling Price are required)</li>
                                    <li>Category names must match existing categories</li>
                                    <li>SKU and Barcode will be auto-generated</li>
                                    <li>Upload the completed CSV file</li>
                                </ul>
                            </div>
                            
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv,.xlsx,.xls"
                                onChange={handleImportFileChange}
                                className="hidden"
                            />
                            
                            <div className="space-y-3">
                                <button
                                    onClick={handleDownloadTemplate}
                                    className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                                >
                                    <MdFileDownload size={18} />
                                    Download Template
                                </button>
                                
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full px-4 py-3 bg-white border-2 border-dashed border-gray-300 text-gray-700 rounded-xl hover:border-[#00c0c7] hover:bg-[#00c0c7]/5 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                                >
                                    <MdFileUpload size={18} />
                                    {importFile ? importFile.name : 'Choose File'}
                                </button>
                            </div>
                            
                            {importErrors.length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 max-h-48 overflow-y-auto">
                                    <p className="text-sm text-red-900 font-medium mb-2">❌ Import Errors:</p>
                                    <ul className="text-xs text-red-800 space-y-1">
                                        {importErrors.map((error, index) => (
                                            <li key={index}>• {error}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        setShowImportModal(false);
                                        setImportFile(null);
                                        setImportErrors([]);
                                    }}
                                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleImport}
                                    disabled={!importFile || loading}
                                    className="flex-1 px-4 py-3 bg-[#00c0c7] text-white rounded-xl hover:bg-[#00a8af] transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Importing..." : "Import"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
                            <h2 className="text-lg md:text-xl font-bold text-gray-900">
                                {editingProduct ? "Edit Product" : "New Product"}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <MdClose className="text-gray-400 w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Product Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Coca Cola 500ml"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#00c0c7]/20 focus:border-[#00c0c7] outline-none transition-all"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        SKU <span className="text-gray-400 font-normal">(auto-generated)</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Auto-generated"
                                        value={formData.sku}
                                        onChange={(e) => setFormData({...formData, sku: e.target.value})}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#00c0c7]/20 focus:border-[#00c0c7] outline-none transition-all"
                                        disabled={!editingProduct}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Barcode <span className="text-gray-400 font-normal">(auto-generated)</span>
                                    </label>
                                    <div className="relative">
                                        <MdQrCode className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Auto-generated"
                                            value={formData.barcode}
                                            onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#00c0c7]/20 focus:border-[#00c0c7] outline-none transition-all"
                                            disabled={!editingProduct}
                                        />
                                    </div>
                                </div>
                                
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#00c0c7]/20 focus:border-[#00c0c7] outline-none transition-all"
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.categoryName || cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Cost Price (TZS) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="1"
                                        placeholder="0"
                                        value={formData.costPrice}
                                        onChange={(e) => setFormData({...formData, costPrice: e.target.value})}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#00c0c7]/20 focus:border-[#00c0c7] outline-none transition-all"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Selling Price (TZS) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="1"
                                        placeholder="0"
                                        value={formData.sellingPrice}
                                        onChange={(e) => setFormData({...formData, sellingPrice: e.target.value})}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#00c0c7]/20 focus:border-[#00c0c7] outline-none transition-all"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Quantity
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#00c0c7]/20 focus:border-[#00c0c7] outline-none transition-all"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Low Stock Alert
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="10"
                                        value={formData.lowStockAlert}
                                        onChange={(e) => setFormData({...formData, lowStockAlert: e.target.value})}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#00c0c7]/20 focus:border-[#00c0c7] outline-none transition-all"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Unit
                                    </label>
                                    <select
                                        value={formData.unit}
                                        onChange={(e) => setFormData({...formData, unit: e.target.value})}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#00c0c7]/20 focus:border-[#00c0c7] outline-none transition-all"
                                    >
                                        {['pcs', 'kg', 'ltr', 'box', 'carton', 'dozen', 'meter', 'gram'].map(u => (
                                            <option key={u} value={u}>{u}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Supplier <span className="text-gray-400 font-normal">(optional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Supplier name"
                                        value={formData.supplier}
                                        onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#00c0c7]/20 focus:border-[#00c0c7] outline-none transition-all"
                                    />
                                </div>
                                
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Description <span className="text-gray-400 font-normal">(optional)</span>
                                    </label>
                                    <textarea
                                        rows="3"
                                        placeholder="Brief description..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#00c0c7]/20 focus:border-[#00c0c7] outline-none transition-all resize-none"
                                    />
                                </div>
                            </div>
                            
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