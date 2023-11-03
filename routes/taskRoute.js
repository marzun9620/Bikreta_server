const {Router}=require('express');

const {
  auth,
  userPic
}= require("../controllers/userAuth");
const {authenticate} = require('../Middlewares/authMiddlewares');
const Discount = require('../models/Discount'); // Import your Discount model
const Offer = require('../models/Offer'); // Import your Offer model

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
  const { User } = require('../models/user');

const router =Router();
const Purchase = require("../models/Purchase");
router.get('/get',getTask);
router.post('/save',saveTask1);
router.put('/update/:id',updateTask);
router.delete('/delete/:id',deleteTask);

router.post('/auth',auth);
router.post('/user', user);
router.get('/user/orders/:id', authenticate,async (req, res) => {
    const userIdFromToken = req.user._id;
    const userIdFromParams = req.params.id;

    if (userIdFromToken !== userIdFromParams) {
        return res.status(403).send('Access denied. You can only access your own data.');
    }
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

router.post('/validate-otp', async (req, res) => {
  console.log(req.body);
  try {
      const { otp, userId } = req.body;

      

      const user = await User.findOne({ otp: otp });


      if (!user) {
          return res.status(404).send({ message: 'User not found.' });
      }

      if (user.verified) {
          return res.status(400).send({ message: 'User is already verified.' });
      }

      // Use the validateOTP method you added to your user schema
      const isValid = user.validateOTP(otp);

      if (isValid) {
          user.verified = true;
          await user.save();
          return res.status(200).send({ message: 'OTP verified successfully.' });
      } else {
          return res.status(401).send({ message: 'Invalid OTP.' });
      }

  } catch (error) {
      console.error('Error during OTP validation:', error);
      return res.status(500).send({ message: 'Internal Server Error' });
  }
});

router.get("/api/user/:userId", async (req, res) => {
    console.log(111111111111);
    const userId = req.params.userId;
  
    try {
      // Retrieve the user profile based on the userId
      const user = await User.findById(userId).select("-password");
  
      if (!user) {
        return res.status(404).send("User not found");
      }
  
      res.send(user);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  });

router.get('/users/:id/verify/:token',emailVar)

router.get('/user/photo/:userId',authenticate,userPic );

module.exports=router;