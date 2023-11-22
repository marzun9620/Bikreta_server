const express = require('express');
const productController = require('../controllers/productController');
const Product = require('../models/Product');
const User = require('../models/user');
const Purchase = require('../models/Purchase');
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

router.get('/status/:filter', async (req, res) => {
  const { filter } = req.params;
  const { category, sortType } = req.query;

  let query = {};

  if (filter && filter !== "ALL") {
    query.orderStatus = filter;
  }

  if (category && category !== "All") {
    const matchingProducts = await Product.find({ category }).select('_id');
    const productIds = matchingProducts.map(product => product._id);
    query.productId = { $in: productIds };
  }

  try {
    let orders;
    
    if (filter === "ALL") {
      // If filter is "ALL," fetch all products in the Purchase schema
      orders = await Purchase.find({}).populate('productId userId');
    } else {
      orders = await Purchase.find(query).populate('productId userId');
    }

    if (sortType === "date") {
      orders.sort((a, b) => new Date(b.orderPlacedDate) - new Date(a.orderPlacedDate));
    } else if (sortType === "upcomingWeek") {
      const oneWeekFromNow = new Date();
      oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
      orders = orders.filter((order) => new Date(order.expectedDeliveryDate) <= oneWeekFromNow);
    }

    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching orders:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});



router.post("/:transactionId/rate", async (req, res) => {
  try {
    const { userId, ratingValue } = req.body;
    const purchases = await Purchase.find({ transactionId: req.params.transactionId });

    if (!purchases || purchases.length === 0) {
      return res.status(404).send("No purchases found for the given transactionId");
    }

    // Iterate through each purchase and update the ratings for the associated product
    for (const purchase of purchases) {
      const product = await Product.findById(purchase.productId);

      if (!product) {
        console.log(`Product not found for purchaseId: ${purchase._id}`);
        continue; // Skip to the next iteration if the product is not found
      }

      const newRating = {
        user: userId,
        ratingValue: parseInt(ratingValue)
      };

      product.ratings.push(newRating);

      if (product.starCounts && product.starCounts[ratingValue]) {
        product.starCounts[ratingValue] += 1;
      } else {
        product.starCounts = { ...product.starCounts, [ratingValue]: 1 };
      }

      const totalRatings = product.ratings.length;
      const totalRatingValue = product.ratings.reduce((acc, curr) => acc + curr.ratingValue, 0);

      product.averageRating = totalRatingValue / totalRatings;
      product.numberOfRatings = totalRatings;

      await product.save();
    }

    res.send({ message: "Ratings added successfully!" });
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


