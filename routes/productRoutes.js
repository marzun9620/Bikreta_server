const express = require('express');
const productController = require('../controllers/productController');
const Product = require('../models/Product');
const router = express.Router();

//router.route(`/image/:productId`).get(productController.getAllProducts);
router.route('/').get(productController.getAllProducts1);
router.route('/').post(productController.createProduct);
router.route('/details/:id').get(productController.productDetails);

 // Assuming your model is one directory up

// Fetch products by category
router.get('/image/:productId',async(req,res)=>{
  //console.log(222);
  try {
      const product = await Product.findById(req.params.productId);
      if (!product || !product.productPhoto) {
          throw new Error('No product image found');
      }
      res.redirect(product.productPhoto.url);
  } catch (error) {
      console.error('Error:', error);
      res.status(404).send('Not Found');
  }

});
router.get('/category/:category', async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.category });
    res.json(products);
   // console.log(products);
    //console.log(1);
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

      // Update the star count for the given rating value
      if(product.starCounts && product.starCounts[ratingValue]) {
          product.starCounts[ratingValue] += 1;
      } else {
          // In case starCounts isn't defined or the specific rating value doesn't exist (this shouldn't happen, but just to be safe)
          product.starCounts = { ...product.starCounts, [ratingValue]: 1 }
      }

      const totalRatings = product.ratings.length;
      const totalRatingValue = product.ratings.reduce((acc, curr) => acc + curr.ratingValue, 0);
      
      product.averageRating = totalRatingValue / totalRatings;
      product.numberOfRatings = totalRatings;

      await product.save();
      
      res.send({ message: "Rating added successfully!" });
  } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
  }
});


router.get("/search", async (req, res) => {
  try {
      const query = req.query.q;  // This captures the query parameter ?q= from the URL

      const products = await Product.find({
          name: { $regex: query, $options: 'i' }  // This regex search will match products that contain the query string
      }).limit(10);  // Limits the results to 10 products

      res.json(products);
  } catch (error) {
      console.error("Error fetching search results:", error);
      res.status(500).send("Error fetching search results.");
  }
});



module.exports = router;


