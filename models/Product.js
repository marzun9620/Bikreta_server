const mongoose = require('mongoose');



const ratingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    ratingValue: {  
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    review: {  
        type: String
    },
    date: {
        type: Date,
        default: Date.now
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
    productImage: {
        url: String,         
        publicId: String,     
        version: String       
    },
	
    ratings: [ratingSchema],
    averageRating: {
        type: Number,
        default: 0
    },
    numberOfRatings: {
        type: Number,
        default: 0
    }
});


const Product = mongoose.model('Product', productSchema);
module.exports = Product;