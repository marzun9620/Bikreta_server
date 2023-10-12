const Product = require('../models/Product');
const Cart = require('../models/Cart'); // Import the Cart model if not already done
const mongoose = require('mongoose');
const Purchase =require('../models/Purchase');
const { generateTransactionId } = require('../utils/utils');
const { generatePDF } = require('../utils/pdfGenrator');


const getCart = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Fetch user's cart
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({ error: "Cart not found for this user." });
        }

        // Filter items where isBought is false and get the count
        const notBoughtItemsCount = cart.items.filter(item => !item.isBought).length;

        res.json({ count: notBoughtItemsCount });
    } catch (error) {
        console.error("Error fetching cart items:", error.message);
        res.status(500).json({ error: "Failed to fetch cart items." });
    }
};



const purchaseProduct = async (req, res) => {
    //console.log(req.body);
    try {
        const { userId, productId, quantity, itemId } = req.body;

        // Update isBought to true in the Cart model for the specific product
        await Cart.updateOne(
            { "user": userId, "items._id": itemId },
            { "$set": { "items.$.isBought": true } }
        );
        const p = await Product.findOne({ _id: productId });

        // Save the purchase in the Purchase model
        const purchase = new Purchase({
            userId,
            productId,
            transactionId: generateTransactionId(),
            quantity,
            totalMakingCost:(p.unitMakingCost * quantity),
            totalPaid:(p.unitPrice * quantity)

        });

        await purchase.save();

        // Generate a PDF (this step will vary depending on what library or service you use)
        const pdfLink = await generatePDF(purchase, userId, productId);

        // Send transactionId and pdfLink as response
        res.json({ transactionId: purchase.transactionId, pdfLink });

    } catch (error) {
        console.error("Error in bank transfer:", error);
        res.status(500).send('Server Error');
    }
};


const getFullCart= async (req, res) => {
    //console.log(req.params.userId);

   try {
    const userId = mongoose.Types.ObjectId(req.params.userId); // Ensure userId is casted to ObjectId
    
    const cart = await Cart.findOne({ user: userId })
        .populate('items.product')
        .exec();

    if (!cart) {
        return res.status(404).json({ message: 'Cart not found for the user' });
    }

    // Filter out items that haven't been bought yet.
    const unboughtItems = cart.items.filter(item => !item.isBought);
    res.json(unboughtItems);
} catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: 'Failed to fetch cart items' });
}
    
};
module.exports = {
    getFullCart,
    getCart,
    purchaseProduct
  };