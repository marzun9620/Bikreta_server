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
    //console.log(products);
  } catch (err) {
   
    res.status(500).json({ message: err.message });
  }
});


router.post("/:productId/rate", async (req, res) => {
  try {
      const { userId, ratingValue } = req.body;
      const product = await Product.findById(req.params.productId);
      
      if (!product) return res.status(404).send("Product not found");
      
      const newRating = {
          user: userId,
          ratingValue: parseInt(ratingValue)
      };
      
      product.ratings.push(newRating);

      const totalRatings = product.ratings.length;
      const totalRatingValue = product.ratings.reduce((acc, curr) => acc + curr.ratingValue, 0);
      
      product.averageRating = totalRatingValue / totalRatings;
      product.numberOfRatings = totalRatings;

      await product.save();
      
      res.send({ message: "Rating added successfully!" });
  } catch (error) {
      res.status(500).send("Server error");
  }
});


module.exports = router;



module.exports = router;
