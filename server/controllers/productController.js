import Product from "../models/Product.js";
import Category from "../models/Category.js";

export const addProduct = async (req, res) => {
    try {
        const {
            name, sku, barcode, category, description,
            costPrice, sellingPrice, quantity, lowStockAlert, supplier, unit
        } = req.body;

        if (!name || !sku || !category || !costPrice || !sellingPrice) {
            return res.status(400).json({
                success: false,
                message: "Name, SKU, Category, Cost Price, and Selling Price are required"
            });
        }

        const existingSKU = await Product.findOne({ sku });
        if (existingSKU) {
            return res.status(400).json({
                success: false,
                message: "SKU already exists"
            });
        }

        if (barcode) {
            const existingBarcode = await Product.findOne({ barcode });
            if (existingBarcode) {
                return res.status(400).json({
                    success: false,
                    message: "Barcode already exists"
                });
            }
        }

        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(400).json({
                success: false,
                message: "Category not found"
            });
        }

        const newProduct = new Product({
            name,
            sku,
            barcode,
            category,
            description,
            costPrice: Number(costPrice),
            sellingPrice: Number(sellingPrice),
            quantity: Number(quantity) || 0,
            lowStockAlert: Number(lowStockAlert) || 10,
            supplier,
            unit,
            createdBy: req.user?.id
        });

        await newProduct.save();

        return res.status(201).json({
            success: true,
            message: "Product added successfully",
            product: await newProduct.populate('category')
        });
    } catch (error) {
        console.error("Error adding product:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

export const getProducts = async (req, res) => {
    try {
        const { search, category, lowStock, page = 1, limit = 20 } = req.query;

        let query = { isActive: true };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } },
                { barcode: { $regex: search, $options: 'i' } }
            ];
        }

        if (category) {
            query.category = category;
        }

        if (lowStock === 'true') {
            query.$expr = { $lte: ['$quantity', '$lowStockAlert'] };
        }

        const skip = (Number(page) - 1) * Number(limit);

        const products = await Product.find(query)
            .populate('category', 'categoryName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await Product.countDocuments(query);
        const lowStockCount = await Product.countDocuments({
            isActive: true,
            $expr: { $lte: ['$quantity', '$lowStockAlert'] }
        });

        return res.status(200).json({
            success: true,
            products,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
                total,
                limit: Number(limit)
            },
            lowStockCount
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (updateData.sku) {
            const existing = await Product.findOne({ 
                sku: updateData.sku, 
                _id: { $ne: id } 
            });
            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: "SKU already exists"
                });
            }
        }

        const updated = await Product.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate('category');

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: updated
        });
    } catch (error) {
        console.error("Error updating product:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Product.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting product:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};