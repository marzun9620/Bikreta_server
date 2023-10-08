const {Router}=require('express');
const router =Router();
const addCategory =require('../controllers/erpController')
router.post('/add/catagory',addCategory);
module.exports=router;