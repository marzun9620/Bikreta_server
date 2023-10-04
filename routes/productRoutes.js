const express = require('express');
const productController = require('../controllers/productController');

const router = express.Router();

router.route(`/image/:productId`).get(productController.getAllProducts);
router.route('/').get(productController.getAllProducts1);
router.route('/').post(productController.createProduct);
router.route('/details/:id').get(productController.productDetails);


module.exports = router;
