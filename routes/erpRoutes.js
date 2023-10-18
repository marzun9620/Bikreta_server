const {Router}=require('express');
const Purchase = require('../models/Purchase');  // Assuming Mongoose Model name is Purchase
const {User} = require('../models/user');
const router =Router();
const {
    addCategory,
    allCatagories,
    addProducts
} =require('../controllers/erpController')


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
  router.get('/total-making-cost', async (req, res) => {
    try {
      const totalMakingCost = await Purchase.aggregate([
        { $group: { _id: null, sum: { $sum: "$totalMakeCost" } } }
      ]);
  
      res.json({ totalMakingCost: totalMakingCost[0].sum });
    } catch (error) {
      res.status(500).send('Server Error');
    }
  });
  
  // Running Orders Count Endpoint
  router.get('/running-orders-count', async (req, res) => {
    try {
      const runningOrders = await Purchase.countDocuments({ orderStatus: "Placed" });
      res.json({ runningOrders });
    } catch (error) {
      res.status(500).send('Server Error');
    }
  });
  
  // Customers Added Count Endpoint
  router.get('/customers-added-count', async (req, res) => {
    try {
      const customersAdded = await User.countDocuments(); // Adjust based on your User model and criteria
      res.json({ customersAdded });
    } catch (error) {
      res.status(500).send('Server Error');
    }
  });
module.exports=router;