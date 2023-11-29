const {Router}=require('express');
const Purchase = require('../models/Purchase');  // Assuming Mongoose Model name is Purchase
const {User} = require('../models/user');
const Product = require('../models/Product');
const O = require('../models/outOfStockOrder');
const Bill = require('../models/Bill')
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
  //new

  router.get('/products-needing-refill', async (req, res) => {
    try {
      const productsNeedingRefill = await Product.find({ totalProducts: 0 });
      res.json(productsNeedingRefill);
    } catch (error) {
      console.error("Error fetching products needing refill:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.patch('/update-product-schema/:id', async (req, res) => {
    const productId = req.params.id;
    const { curtonStock, curtonSize } = req.body;
  
    try {
      // Calculate totalProducts based on curtonSize and curtonStock
      const totalProducts = curtonSize * curtonStock;
  
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { $set: { cartonStock: curtonStock, cartonSize: curtonSize, totalProducts: totalProducts } },
        { new: true }
      );
      console.log(updatedProduct);
  
      if (!updatedProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }
  
      res.json({ message: 'Product schema updated successfully', product: updatedProduct });
    } catch (error) {
      console.error('Error updating product schema', error);
      res.status(500).json({ error: 'Internal Server Error' });
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

  router.get('/erp/api/product/:productId', async (req, res) => {
    try {

      const productId = req.params.productId;
     // console.log(productId);
      // Find the product by productId in the MongoDB collection
      const product = await Product.findOne({ productId });
  
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      // If product is found, send the details in the response
      res.status(200).json(product);
    } catch (error) {
      console.error('Error fetching product details:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  router.get("/erp/api/running", async (req, res) => {
    try {
      // Assuming "Running" is the status you are checking for
      const runningOrders = await Purchase.find({ orderStatus: "Running" });
     
      res.json(runningOrders);
    } catch (error) {
      console.error("Error fetching running orders:", error);
      res.status(500).json({ error: "Internal Server Error" });
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

router.get('/api1/placed', async (req, res) => {
  try {
    const categoryFilter = req.query.category;
    const orderStatusFilter = req.query.orderStatus;

    let query = { orderStatus: 'Placed' }; // Default filter for 'Placed' orders

    if (categoryFilter && categoryFilter.toLowerCase() !== 'all') {
      // Find products based on the selected category
      const category = await Category.findOne({ name: categoryFilter });
      if (category) {
        const products = await Product.find({ category: category.name });

        // Get the product IDs
        const productIds = products.map((product) => product._id);

        // Add product filter to the query
        query.productId = { $in: productIds };
      }
    }

    if (orderStatusFilter && orderStatusFilter.toLowerCase() === 'running') {
      // If orderStatus is 'Running', update the query
      query.orderStatus = 'Running';
    }

    // Find purchases based on the constructed query
    const purchases = await Purchase.find(query);

    return res.json(purchases);
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Modify the /api/placed route in your server-side code (e.g., Express.js)
router.get('/22api/placed/Delivered', async (req, res) => {
  try {
    const categoryFilter = req.query.category;
    console.log(req.query.category);
    if (categoryFilter && categoryFilter.toLowerCase() !== 'all') {
      // Find products based on the selected category
      const category = await Category.findOne({ name: categoryFilter });
      if (category) {
        const products = await Product.find({ category: category.name });

        // Get the product IDs
        const productIds = products.map((product) => product._id);

        // Find purchases for the selected products with orderStatus 'Placed'
        const purchases = await O.find({
          productId: { $in: productIds },
          orderStatus: 'Mes',
        });
        console.log(purchases);
        return res.json(purchases);
      }
    } else {
      // If category is 'All', select all products from purchases where orderStatus is 'Placed'
      const allPurchases = await O.find({ orderStatus: 'Mes' });
      return res.json(allPurchases);
    }

    // If the category is not found or 'All' is not selected, return an empty array
    res.json([]);
  } catch (error) {
    console.error('Error fetching placed purchases:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/22api1/placed/Delivered', async (req, res) => {
  try {
    const categoryFilter = req.query.category;
    const orderStatusFilter = req.query.orderStatus;

    let query = { orderStatus: 'Mes' }; // Default filter for 'Placed' orders

    if (categoryFilter && categoryFilter.toLowerCase() !== 'all') {
      // Find products based on the selected category
      const category = await Category.findOne({ name: categoryFilter });
      if (category) {
        const products = await Product.find({ category: category.name });

        // Get the product IDs
        const productIds = products.map((product) => product._id);

        // Add product filter to the query
        query.productId = { $in: productIds };
      }
    }

    if (orderStatusFilter && orderStatusFilter.toLowerCase() === 'running') {
      // If orderStatus is 'Running', update the query
      query.orderStatus = 'Mes';
    }

    // Find purchases based on the constructed query
    const purchases = await O.find(query);

    return res.json(purchases);
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.post('/erp/api/bills/generate', async (req, res) => {
  try {
    const { products, totalRevenue } = req.body;

    // Aggregate quantities and total making costs for each unique product ID
    const aggregatedProducts = products.reduce((result, product) => {
      const existingProduct = result.find(p => p.productId.toString() === product.productId.toString());

      if (existingProduct) {
        // If product ID already exists, update quantity and totalMakeCost
        existingProduct.quantity += product.quantity;
        existingProduct.totalMakeCost += product.totalMakeCost;
      } else {
        // If product ID is new, add it to the result array
        result.push({
          productId: product.productId,
          quantity: product.quantity,
          totalMakeCost: product.totalMakeCost
        });
      }

      return result;
    }, []);

    // Assuming that the products array follows the structure in the Bill schema
    const billData = {
      products: aggregatedProducts,
      totalRevenue,
    };

    const newBill = new Bill(billData);
    await newBill.save();

    // Update orderStatus to 'Mes' for products in the aggregatedProducts array
    const productIdsToUpdate = aggregatedProducts.map(product => product.productId);
    await Purchase.updateMany({ productId: { $in: productIdsToUpdate } }, { orderStatus: 'Mes' });

    res.status(201).json({ message: 'Bill generated successfully' });
  } catch (error) {
    console.error('Error generating bill:', error);
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

router.put('/api/update-status/Delivered', async (req, res) => {
  try {
    const { category } = req.query;
    let query = { orderStatus: 'Mes' };

    if (category && category !== 'All') {
      // If a specific category is selected
      // Fetch product IDs based on the category
      const productIds = await Product.find({ category }).distinct('_id');
      query.productId = { $in: productIds };
    }

    // Update orderStatus for all placed orders that match the query to 'Running'
    if (category !== 'All') {
      // If a specific category is selected
      await O.updateMany(query, { $set: { orderStatus: 'Delivered' } });
    } else {
      // If 'All' is selected, update the orderStatus for all placed orders
      await O.updateMany({ orderStatus: 'Mes' }, { $set: { orderStatus: 'Delivered' } });
    }

    res.json({ message: 'Order status updated successfully.' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ... other routes

module.exports=router;