const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
   productName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    unitPrice: {
        type: Number,
        required: true,
        min: 0
    },
    cartonSize: {
        type: Number,
        required: true
    },
    cartonStock: {
        type: Number,
        required: true,
        min: 0
    },
    minStockThreshold: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        ref: 'Category'
    },
    ratingCount: {
        type: Number,
        default: 0
    },
    avgRating: {
        type: Number,
        default: 0
    }
});

// Middleware to update the avgRating based on ratingCount
// You might want to handle this logic when users rate the product in your service logic instead
productSchema.pre('save', function(next) {
    if (this.isModified('ratingCount') || this.isModified('avgRating')) {
        this.avgRating = this.ratingCount / (this.avgRating || 1);
    }
    next();
});

module.exports = mongoose.model('Product', productSchema);
