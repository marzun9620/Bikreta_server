const Product = require('../models/Product');
const Cart = require('../models/Cart');
const mongoose = require('mongoose');
const Category = require('../models/Catagory')
const Discount = require('../models/Discount'); // Import the Discount model/sche

const addToCart = async (req, res) => {
    console.log(req.body);
    try {
        const { userId, productId, quantity, price } = req.body;

        // Fetch the user's cart or create one if it doesn't exist
        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        // Fetch the product to get its category
        const product = await Product.findById(productId);
        const productCategoryName = product.category; // Assuming 'category' is a field in the Product model

        console.log('Product Category Name:', productCategoryName);

        // Find the category ID based on the product's category name
        const productCategory = await Category.findOne({ name: productCategoryName });

        console.log('Product Category ID:', productCategory._id);

        // Find the discount based on the product's category
        const productDiscount = await Discount.findOne({ selectedCategory: productCategory._id });

        console.log('Product Discount:', productDiscount);

        // Calculate the discounted price if a discount is available
        const discountedPrice = productDiscount
            ? price - (price * productDiscount.discountPercentage) / 100
            : price;

        const existingItemIndex = cart.items.findIndex(item =>
            item.product.toString() === productId && !item.isBought
        );

        if (existingItemIndex !== -1) {
            // Update the existing item's quantity and price
            cart.items[existingItemIndex].quantity += quantity;
            cart.items[existingItemIndex].price = discountedPrice; // Update with discounted price
        } else {
            // Add a new item to the cart
            cart.items.push({
                product: productId,
                quantity,
                price: discountedPrice, // Use the discounted price for new items
                isBought: false
            });
        }

        await cart.save();

        res.status(200).send("Product added to cart");

    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).send('Server Error');
    }
};



module.exports=addToCart;