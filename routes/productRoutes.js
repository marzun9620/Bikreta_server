const express = require('express');
const productController = require('../controllers/productController');
const Product = require('../models/Product');
const router = express.Router();

router.route(`/image/:productId`).get(productController.getAllProducts);
router.route('/').get(productController.getAllProducts1);
router.route('/').post(productController.createProduct);
router.route('/details/:id').get(productController.productDetails);

 // Assuming your model is one directory up

// Fetch products by category
router.get('/category/:category', async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.category });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;



module.exports = router;
