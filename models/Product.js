const mongoose = require('mongoose');

const imageSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        data: Buffer,
        contentType: String
    }
});
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    countInStock: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    productImage: imageSchema
});


const Product = mongoose.model('Product', productSchema);

module.exports = Product;
