const Product = require('../models/Product');
const Cart = require('../models/Cart');

const addToCart = async (req, res) => {
   console.log(req.body);
    try {
        const { userId, productId, quantity, price } = req.body;

        // Fetch the user's cart or create one if it doesn't exist
        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        const existingItemIndex = cart.items.findIndex(item => 
            item.product.toString() === productId && !item.isBought
        );

        if (existingItemIndex !== -1) {
            // Update the existing item's quantity and price
            cart.items[existingItemIndex].quantity += quantity;
            cart.items[existingItemIndex].price = price; // You might adjust this logic if you're storing total price instead of unit price
        } else {
            // Add a new item to the cart
            cart.items.push({
                product: productId,
                quantity,
                price,
                isBought: false
            });
        }

        await cart.save();

        // Emit a socket event to notify the front-end of the cart update
    // Use io from req object// 'cartUpdated' is the event name, and we're sending the user's ID as the payload
        
        res.status(200).send("Product added to cart");

    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).send('Server Error');
    }
};

module.exports = addToCart;


module.exports=addToCart;