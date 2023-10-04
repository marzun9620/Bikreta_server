const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    quantity: {
        type: Number,
        required: true,
        min: 1  // Assuming the minimum quantity one can purchase is 1
    }
});

const Purchase = mongoose.model("Purchase", purchaseSchema);

module.exports = Purchase;
