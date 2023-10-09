const {Router}=require('express');
const router =Router();
const {
    addCategory,
    allCatagories,
    addProducts
} =require('../controllers/erpController')


router.post('/add/catagory',addCategory);
router.get('/all/categories',allCatagories);
router.post('/add1/products',addProducts);
module.exports=router;