const {Router}=require('express');
require('dotenv').config();
const Product = require('../models/Product');
const Cart = require('../models/Cart'); // Import the Cart model if not already done
const mongoose = require('mongoose');
const Purchase =require('../models/Purchase');
const OutofStock1 =require('../models/outOfStockOrder');
const { generateTransactionId } = require('../utils/utils');
const { generatePDF } = require('../utils/pdfGenrator');
const {generateOverallPDF} =require ('../utils/OverallPdfgenerator');

const SSLCommerzPayment = require('sslcommerz-lts')
const store_id = process.env.STORE_ID
const store_passwd = process.env.STORE_PASS
const is_live = false //true for live, false for sandbox
const io = require('socket.io')
const BASE_URL="https://bikreta.onrender.com"
//const BASE_URL="http://localhost:3000"

const router =Router();
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


{/* const purchaseProduct = async (req, res) => {
    //console.log(req.body);
    try {
        const { userId, productId, quantity, itemId } = req.body;

        // Update isBought to true in the Cart model for the specific product
        await Cart.updateOne(
            { "user": userId, "items._id": itemId },
            { "$set": { "items.$.isBought": true } }
        );
        const p = await Product.findOne({ _id: productId });
        const currentDate = new Date();
const expectedDelivery = new Date();
expectedDelivery.setDate(currentDate.getDate() + 7);


        //console.log(p);
        // Save the purchase in the Purchase model
        const purchase = new Purchase({
            userId,
            productId,
            transactionId: generateTransactionId(),
            expectedDeliveryDate: expectedDelivery,
            actualDeliveryDate: expectedDelivery,
            orderPlacedDate: currentDate,
            orderStatus:'Placed',
            quantity,
            totalMakeCost:(p.unitMakeCost * quantity),
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
};*/}


const purchaseProduct = async (req, res) => {
    const { userId, productId, quantity, itemId, permit } = req.body;
    
    if (!productId) {
        return res.status(400).json({ message: 'Invalid productId' });
    }
    console.log(1);

    const p = await Product.findOne({ _id: productId });
    if (!p) {
        return res.status(404).json({ message: 'Product not found' });
    }
    console.log(2);
    if (p.totalProducts < quantity) {
        return res.status(400).json({ message: 'Insufficient stock' });
    }
    console.log(3);
      // Calculate the updated stock after purchase
     
      // Update the product stock in the database
      console.log(4);
    const currentDate = new Date();
const expectedDelivery = new Date();
expectedDelivery.setDate(currentDate.getDate() + 7);
if(permit==2){
    await Cart.updateOne(
        { "user": userId, "items._id": itemId },
        { "$set": { "items.$.isBought": true } }
    );
}
   
  const tran_id=generateTransactionId();
    const data = {
        total_amount: (p.unitPrice * quantity),
        currency: 'BDT',
        tran_id:tran_id,  // use unique tran_id for each api call
        success_url: `${BASE_URL}/hob1/checkout/okk/${tran_id}`,
        fail_url: 'http://localhost:3030/fail',
        cancel_url: 'http://localhost:3030/cancel',
        ipn_url: 'http://localhost:3030/ipn',
        shipping_method: 'Courier',
        product_name: 'Computer.',
        product_category: 'Electronic',
        product_profile: 'general',
        cus_name: 'Customer Name',
        cus_email: 'customer@example.com',
        cus_add1: 'Dhaka',
        cus_add2: 'Dhaka',
        cus_city: 'Dhaka',
        cus_state: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: '01711111111',
        cus_fax: '01711111111',
        ship_name: 'Customer Name',
        ship_add1: 'Dhaka',
        ship_add2: 'Dhaka',
        ship_city: 'Dhaka',
        ship_state: 'Dhaka',
        ship_postcode: 1000,
        ship_country: 'Bangladesh',
    };
    const purchase = new Purchase({
        userId,
        productId,
        transactionId: tran_id,
        expectedDeliveryDate: expectedDelivery,
        actualDeliveryDate: expectedDelivery,
        orderPlacedDate: currentDate,
        orderStatus:'Placed',
        quantity,
        totalMakeCost:(p.unitMakeCost * quantity),
        totalPaid:(p.unitPrice * quantity),
        paymentStatus:"false"

    });
    
    const p1 = await Product.findOne({ _id: productId });
     const updatedCartonStock = p1.totalProducts - quantity;
     
      p1.totalProducts = updatedCartonStock;
  await p1.save();
  await purchase.save();
    
        // Generate a PDF (this step will vary depending on what library or service you use)
        const pdfLink = await generatePDF(purchase, userId, productId);

        // Send transactionId and pdfLink as response
       
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
    sslcz.init(data).then(apiResponse => {
        // Redirect the user to payment gateway
        let GatewayPageURL = apiResponse.GatewayPageURL
       // res.redirect(GatewayPageURL)
      
       res.json({ url:GatewayPageURL,transactionId: purchase.transactionId, pdfLink });
        console.log('Redirecting to: ', GatewayPageURL)
    });

 
};
/*----------------------------------Out of stock order-----------------------------*/
const outOfSTock1 = async (req, res) => {
    const { userId, productId, quantity, itemId, permit } = req.body;
    
    if (!productId) {
        return res.status(400).json({ message: 'Invalid productId' });
    }
    console.log(1);

    const p = await Product.findOne({ _id: productId });
    if (!p) {
        return res.status(404).json({ message: 'Product not found' });
    }
   
    console.log(3);
      // Calculate the updated stock after purchase
     
      // Update the product stock in the database
      console.log(4);
    const currentDate = new Date();
const expectedDelivery = new Date();
expectedDelivery.setDate(currentDate.getDate() + 7);

   
  const tran_id=generateTransactionId();
    const data = {
        total_amount: (p.unitPrice * quantity),
        currency: 'BDT',
        tran_id:tran_id,  // use unique tran_id for each api call
        success_url: `${BASE_URL}/hob1/checkout/okk/${tran_id}`,
        fail_url: 'http://localhost:3030/fail',
        cancel_url: 'http://localhost:3030/cancel',
        ipn_url: 'http://localhost:3030/ipn',
        shipping_method: 'Courier',
        product_name: 'Computer.',
        product_category: 'Electronic',
        product_profile: 'general',
        cus_name: 'Customer Name',
        cus_email: 'customer@example.com',
        cus_add1: 'Dhaka',
        cus_add2: 'Dhaka',
        cus_city: 'Dhaka',
        cus_state: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: '01711111111',
        cus_fax: '01711111111',
        ship_name: 'Customer Name',
        ship_add1: 'Dhaka',
        ship_add2: 'Dhaka',
        ship_city: 'Dhaka',
        ship_state: 'Dhaka',
        ship_postcode: 1000,
        ship_country: 'Bangladesh',
    };
    const OutOfSTock = new OutofStock1({
        userId,
        productId,
        transactionId: tran_id,
        expectedDeliveryDate: expectedDelivery,
        actualDeliveryDate: expectedDelivery,
        orderPlacedDate: currentDate,
        orderStatus:'Mes',
        quantity,
        totalMakeCost:(p.unitMakeCost * quantity),
        totalPaid:(p.unitPrice * quantity),
        paymentStatus:"false"

    });

  await OutOfSTock.save();
    
        // Generate a PDF (this step will vary depending on what library or service you use)
        const pdfLink = await generatePDF(OutOfSTock, userId, productId);

        // Send transactionId and pdfLink as response
       
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
    sslcz.init(data).then(apiResponse => {
        // Redirect the user to payment gateway
        let GatewayPageURL = apiResponse.GatewayPageURL
       // res.redirect(GatewayPageURL)
      
       res.json({ url:GatewayPageURL,transactionId: OutOfSTock.transactionId, pdfLink });
        console.log('Redirecting to: ', GatewayPageURL)
    });

 
};
/*--------------------------*/
const purchaseOverAllProduct = async (req, res) => {
    try {
        const { userId, cartItems,sum} = req.body;
        const purchaseResponses = [];
        const tran_id = generateTransactionId();
       
        for (const item of cartItems) {
            const { product, quantity, price, isBought, _id } = item;

            if (!product || !product._id) {
                return res.status(400).json({ message: 'Invalid product' });
            }

            const productId = product._id;

         // console.log(item);

          
                // If found, increase the quantity of the existing item
                await Cart.updateOne(
                    { "user": userId, "items._id": item._id },
                    { "$set": { "items.$.isBought": true } }
                );
                //Push the response for the current item to the array
             // console.log("Hello")

            const p = await Product.findOne({ _id: productId });
            if (!p) {
                return res.status(404).json({ message: 'Product not found' });
            }

            if (p.totalProducts < quantity) {
                return res.status(400).json({ message: 'Insufficient stock' });
            }

            // Calculate the updated stock after purchase
            const currentDate = new Date();
            const expectedDelivery = new Date();
            expectedDelivery.setDate(currentDate.getDate() + 7);

            const purchase = new Purchase({
                userId,
                productId,
                transactionId: tran_id,
                expectedDeliveryDate: expectedDelivery,
                actualDeliveryDate: expectedDelivery,
                orderPlacedDate: currentDate,
                orderStatus: 'Placed',
                quantity,
                totalMakeCost: (p.unitMakeCost * quantity),
                totalPaid: (p.unitPrice * quantity),
                paymentStatus: "false"
            });

           // console.log("Hello11")

            const p1 = await Product.findOne({ _id: productId });
            const updatedCartonStock = p1.totalProducts - quantity;
            p1.totalProducts = updatedCartonStock;
            await p1.save();
            await purchase.save();

        }

        // Generate a single PDF for all items in the cart
        const pdfLink = await generateOverallPDF(cartItems, userId,tran_id);
       console.log(pdfLink);
        // Update pdfLink in each response
     

        const data = {
            total_amount: sum,
            currency: 'BDT',
            tran_id: tran_id,  // use unique tran_id for each API call
            success_url: `${BASE_URL}/hob1/checkout/overall/okk/${tran_id}?pdfLink=${pdfLink}`,
            fail_url: 'http://localhost:3030/fail',
            cancel_url: 'http://localhost:3030/cancel',
            ipn_url: 'http://localhost:3030/ipn',
            shipping_method: 'Courier',
            product_name: 'Computer.',
            product_category: 'Electronic',
            product_profile: 'general',
            cus_name: 'Customer Name',
            cus_email: 'customer@example.com',
            cus_add1: 'Dhaka',
            cus_add2: 'Dhaka',
            cus_city: 'Dhaka',
            cus_state: 'Dhaka',
            cus_postcode: '1000',
            cus_country: 'Bangladesh',
            cus_phone: '01711111111',
            cus_fax: '01711111111',
            ship_name: 'Customer Name',
            ship_add1: 'Dhaka',
            ship_add2: 'Dhaka',
            ship_city: 'Dhaka',
            ship_state: 'Dhaka',
            ship_postcode: 1000,
            ship_country: 'Bangladesh',
        };

        const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
        sslcz.init(data).then(apiResponse => {
            if (apiResponse.GatewayPageURL) {
                // Continue with the rest of the code
              //  console.log('Redirecting to: ', apiResponse.GatewayPageURL);
                res.json({ url: apiResponse.GatewayPageURL, transactionId: tran_id, pdfLink });
            } else {
                console.error("Invalid response from SSLCommerz:", apiResponse);
                res.status(500).json({ error: "Internal Server Error" });
            }
        });
    } catch (error) {
        console.error("Error during purchaseProduct:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Function to generate a single PDF for all items in the cart
const generateOverallPDF1 = async (cartItems, userId) => {
    // Implement your logic to generate a PDF for all items in the cart
    // You can use cartItems and userId to fetch necessary information
    // Return the link or path to the generated PDF
    const pdfLink = await generateOverallPDF(cartItems, userId);
    return pdfLink;
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
    purchaseProduct,
    purchaseOverAllProduct,
    outOfSTock1 
  };