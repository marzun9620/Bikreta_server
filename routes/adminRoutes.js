require("dotenv").config();
const {Router}=require('express');
const router =Router();
const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');
const {User} = require('../models/user');
const Cart = require('../models/Cart');
const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const {authAdmin} = require('../Middlewares/authMiddlewares');
const jwt = require("jsonwebtoken");
router.get("/api/monthly-best-products", async (req, res) => {
  console.log('Annnaya');
  try {
    // Calculate the start and end dates for the current month
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    // Use an aggregation pipeline to group and count purchases by product
    const bestProducts = await Purchase.aggregate([
      {
        $match: {
          orderPlacedDate: {
            $gte: firstDayOfMonth,
            $lte: lastDayOfMonth,
          },
        },
      },
      {
        $group: {
          _id: "$productId",
          totalSales: { $sum: "$quantity" },
        },
      },
      {
        $lookup: {
          from: "products", // Replace "products" with the actual name of your products collection
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $sort: { totalSales: -1 },
      },
      {
        $limit: 10, // Get the top 10 best-selling products
      },
    ]);
//console.log(bestProducts)
    res.json(bestProducts);
  } catch (error) {
    console.error("Error fetching monthly best products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post('/signup', async (req, res) => {
   // console.log(req.body);
    let admin = await Admin.findOne({ email: req.body.email });
    if (admin) return res.status(400).send('Admin already registered.');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    console.log(req.body.password);

    admin = new Admin({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    });

    await admin.save();
    res.status(201).send({
        username: admin.username,
        email: admin.email
    });
});

router.get('/2api/user/:userId/cart', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find the user's cart items by userId and isBought equal to false
    const userCart = await Cart.findOne({ user: userId, isBought: false }).populate('items.product');

    // Check if the user has any items in the cart
    if (!userCart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    // Respond with the user's cart data
    res.json(userCart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.get('/track/products/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;

    // Find the latest purchase with the given productId
    const latestPurchase = await Purchase.findOne({ productId }).sort({ orderPlacedDate: -1 });

    if (!latestPurchase) {
      return res.status(404).json({ success: false, message: 'No purchase found for the product' });
    }

    // Send the latest order status as a JSON response
    res.status(200).json({ success: true, orderStatus: latestPurchase.orderStatus });
  } catch (error) {
    console.error('Error fetching order status:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});




router.post('/login', async (req, res) => {
   // console.log(11);
    let admin = await Admin.findOne({ email: req.body.email });
   // console.log(admin.password);
    if (!admin) return res.status(401).send('Invalid email or password.');
  

// Assuming admin.password contains the hashed password stored in the database
const isPasswordValid = await bcrypt.compare(req.body.password, admin.password);

if (!isPasswordValid) return res.status(400).send('Invalid email or password.');


    const token = admin.generateAuthToken();
    res.status(200).send({
        token: token, // Include the token in the response body
        username: admin.username,
        email: admin.email
    });
    
    
});






router.get("/api/verify-admin-token", (req, res) => {
  const token = req.headers["x-auth-token"]; // Assuming the token is sent in the request headers
  //
  // Check if the token is an admin token (implement your own logic)
  if (isTokenAdmin(token)) {
    //console.log(token);
    res.status(200).json({ message: "Token is an admin token" });
  } else {
    //console.log(33333);
    res.status(403).json({ message: "Token is not an admin token" });
  }
});

// Implement your own logic to check if a token is an admin token
function isTokenAdmin(token) {
    try {
      const decoded = jwt.verify(token, process.env.KEYADMIN);
      // Verify if the token contains the isAdmin claim
      return decoded.isAdmin === true;
    } catch (error) {
      // Handle token verification errors, such as expired or invalid tokens
      return false;
    }
  }


  // API endpoint to fetch all users
router.get('/api/allusers', async (req, res) => {
  try {
    console.log(11);
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.get('/api/user/:userId/purchase-history', async (req, res) => {
  const userId = req.params.userId;
  const filteredCategory = req.query.category;

  try {
    // Implement the logic to fetch purchase history based on userId and filteredCategory
    // You should use your Mongoose models and schema to query the database

    // Example: Fetch purchase history for the specified user with category filtering
    const purchaseHistory = await Purchase.find({ userId, category: filteredCategory });

    // Now, let's populate the product details for each purchase
    const populatedPurchaseHistory = await Purchase.populate(purchaseHistory, { path: 'productId' });
   //console.log(populatedPurchaseHistory)
    res.json(populatedPurchaseHistory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/api/user/:userId/purchase-history/:userId', async (req, res) => {
  const userId = req.params.userId;
  const filteredCategory = req.query.category;
  const filteredPriceRange = req.query.priceRange;

  try {
   
    const query = { userId };

    if (filteredCategory) {
      query.category = filteredCategory;
    }

    if (filteredPriceRange) {
      const priceRangeArray = filteredPriceRange.split('-');
      if (priceRangeArray.length === 2) {
        query.price = {
          $gte: parseFloat(priceRangeArray[0]),
          $lte: parseFloat(priceRangeArray[1]),
        };
      }
    }

    // Use Mongoose to query the database
    const purchaseHistory = await Purchase.find(query);

    res.json(purchaseHistory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports=router;