import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    sku: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    barcode: {
        type: String,
        unique: true,
        sparse: true, // Allows null/undefined values to not trigger unique constraint
        trim: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    description: {
        type: String,
        trim: true,
        default: ""
    },
    costPrice: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    sellingPrice: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    lowStockAlert: {
        type: Number,
        default: 10,
        min: 0
    },
    supplier: {
        type: String,
        trim: true,
        default: ""
    },
    unit: {
        type: String,
        default: "pcs",
        enum: ['pcs', 'kg', 'ltr', 'box', 'carton', 'dozen', 'meter', 'gram']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    images: [{
        type: String // URLs to images
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Index for search
productSchema.index({ name: 'text', sku: 'text', barcode: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product;