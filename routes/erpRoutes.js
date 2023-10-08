const {Router}=require('express');
const router =Router();
const {
    addCategory,
    allCatagories
} =require('../controllers/erpController')
router.post('/add/catagory',addCategory);
router.get('/all/categories',allCatagories);
module.exports=router;