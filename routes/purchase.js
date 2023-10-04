const {Router}=require('express');

const addToCart=require('../controllers/addToCart') ;
const {
   
    purchaseProduct
  } = require('../controllers/cart');

const router =Router();

router.post('/bank',purchaseProduct)

module.exports=router;