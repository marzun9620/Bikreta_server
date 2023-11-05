const {Router}=require('express');
const Purchase = require('../models/Purchase');  // Assuming Mongoose Model name is Purchase
const {User} = require('../models/user');
const Product = require('../models/Product');
const Category=require('../models/Catagory')  // Assuming the path to the product model
const router =Router();
const {
    addCategory,
    allCatagories,
    addProducts
} =require('../controllers/erpController')
const {authAdmin} = require('../Middlewares/authMiddlewares');

router.post('/add/catagory',addCategory);
router.get('/all/categories',allCatagories);
router.post('/add1/products',addProducts);

// Total Cost Endpoint
router.get('/total-cost', async (req, res) => {
    try {
      const totalCost = await Purchase.aggregate([
        { $match: { orderStatus: "Placed" } },
        { $group: { _id: null, sum: { $sum: "$totalPaid" } } }
      ]);
  
      res.json({ totalCost: totalCost[0].sum });
    } catch (error) {
      res.status(500).send('Server Error');
    }
  });
  
  // Total Making Cost Endpoint
  router.get('/total-making-cost', authAdmin,async (req, res) => {
    try {
      const totalMakingCost = await Purchase.aggregate([
        { $match: { orderStatus: "Placed" } },
        { $group: { _id: null, sum: { $sum: "$totalMakeCost" } } }
      ]);
  
      res.json({ totalMakingCost: totalMakingCost[0].sum });
    } catch (error) {
      res.status(500).send('Server Error');
    }
  });
  
  // Running Orders Count Endpoint
  router.get('/running-orders-count',authAdmin, async (req, res) => {
    try {
      const runningOrders = await Purchase.countDocuments({ orderStatus: "Placed" });
      res.json({ runningOrders });
    } catch (error) {
      res.status(500).send('Server Error');
    }
  });
  
  // Customers Added Count Endpoint
  router.get('/customers-added-count',authAdmin, async (req, res) => {
    try {
      const customersAdded = await User.countDocuments(); // Adjust based on your User model and criteria
      res.json({ customersAdded });
    } catch (error) {
      res.status(500).send('Server Error');
    }
  });


// Search products
router.get('/products/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(400).send({ error: 'Search query is required' });
        }

        const products = await Product.find({
            productName: new RegExp(query, 'i')
        });

        return res.status(200).send(products);

    } catch (err) {
        return res.status(500).send({ error: 'Internal Server Error' });
    }
});
// Assuming you've already required express, router, and the Category model

// Search categories
router.get('/categories/search', async (req, res) => {
  try {
      const query = req.query.q;
      if (!query) {
          return res.status(400).send({ error: 'Search query is required' });
      }

      const categories = await Category.find({
          name: new RegExp(query, 'i')
      });

      return res.status(200).send(categories);

  } catch (err) {
      return res.status(500).send({ error: 'Internal Server Error' });
  }
});

// ... other routes

module.exports=router;