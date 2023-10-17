const {Router}=require('express');

const {
  auth,
  userPic
}= require("../controllers/userAuth");


const {
    getTask,
    saveTask1,
    updateTask,
    deleteTask
  } = require('../controllers/taskControllers');
  const {
    user,
    emailVar
  } = require('../controllers/createUser');
  

const router =Router();
const Purchase = require("../models/Purchase");
router.get('/get',getTask);
router.post('/save',saveTask1);
router.put('/update/:id',updateTask);
router.delete('/delete/:id',deleteTask);

router.post('/auth',auth);
router.post('/user', user);
router.get('/user/orders/:id', async (req, res) => {
  // Normally, you might get the user's ID from the authentication middleware
  // For example:
  // const userId = req.user.id;
  const userId = req.params.id;

  try {
      const purchases = await Purchase.find({ userId })
          .populate('productId')
          .populate('discountId')
          .exec();

      res.json({
          success: true,
          data: purchases
      });
  } catch(err) {
      console.error("Error fetching purchases:", err);
      res.status(500).json({
          success: false,
          message: 'Internal Server Error'
      });
  }
});


router.get('/users/:id/verify/:token',emailVar)

router.get('/user/photo/:userId',userPic );

module.exports=router;