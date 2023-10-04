const {Router}=require('express');

const addToCart=require('../controllers/addToCart') ;
const {
    getCart,
    getFullCart,
    purchaseProduct
  } = require('../controllers/cart');

const router =Router();
router.post('/:userId/add', addToCart);
router.get('/count/:userId',getCart)
router.get('/marzun/:userId',getFullCart)

module.exports=router;