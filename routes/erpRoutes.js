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

router.post('/add/catagory',authAdmin,addCategory);
router.get('/all/categories',authAdmin,allCatagories);
router.post('/add1/products',authAdmin,addProducts);

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


// Modify the /api/placed route in your server-side code (e.g., Express.js)
router.get('/api/placed', async (req, res) => {
  try {
    const categoryFilter = req.query.category;

    if (categoryFilter && categoryFilter.toLowerCase() !== 'all') {
      // Find products based on the selected category
      const category = await Category.findOne({ name: categoryFilter });
      if (category) {
        const products = await Product.find({ category: category.name });

        // Get the product IDs
        const productIds = products.map((product) => product._id);

        // Find purchases for the selected products with orderStatus 'Placed'
        const purchases = await Purchase.find({
          productId: { $in: productIds },
          orderStatus: 'Placed',
        });

        return res.json(purchases);
      }
    } else {
      // If category is 'All', select all products from purchases where orderStatus is 'Placed'
      const allPurchases = await Purchase.find({ orderStatus: 'Placed' });
      return res.json(allPurchases);
    }

    // If the category is not found or 'All' is not selected, return an empty array
    res.json([]);
  } catch (error) {
    console.error('Error fetching placed purchases:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/api/update-status', async (req, res) => {
  try {
    const { category } = req.query;
    let query = { orderStatus: 'Placed' };

    if (category && category !== 'All') {
      // If a specific category is selected
      // Fetch product IDs based on the category
      const productIds = await Product.find({ category }).distinct('_id');
      query.productId = { $in: productIds };
    }

    // Update orderStatus for all placed orders that match the query to 'Running'
    if (category !== 'All') {
      // If a specific category is selected
      await Purchase.updateMany(query, { $set: { orderStatus: 'Running' } });
    } else {
      // If 'All' is selected, update the orderStatus for all placed orders
      await Purchase.updateMany({ orderStatus: 'Placed' }, { $set: { orderStatus: 'Running' } });
    }

    res.json({ message: 'Order status updated successfully.' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ... other routes

module.exports=router;