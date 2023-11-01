const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); // Import your Product model
const Category = require('../models/Catagory'); // Import your Category model
const Discount = require('../models/Discount'); // Import your Discount model
const Offer = require('../models/Offer'); // Import your Offer model

// Route to get discount and offer details for a product by its _id
router.get('/discount-and-offer/:productId', async (req, res) => {
  const productId = req.params.productId;

  try {
    const productDetails = {};

    // Find the product by its _id
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    // Get the category of the product
    const category = await Category.findOne({ name: product.category });

    if (!category) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    // Get the discount for the category
    const discount = await Discount.findOne({ selectedCategory: category._id });

    // Get the offer for the category
    const offer = await Offer.findOne({ selectedCategory: category._id });

    productDetails.discount = discount ? discount.discountPercentage : 0; // Return 0 if no discount found
    productDetails.offer = offer ? offer.offerDescription : 'No offer available'; // Return a default message if no offer found
    console.log(productDetails);
    res.json(productDetails);
  } catch (error) {
    console.error('Error fetching discount and offer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
